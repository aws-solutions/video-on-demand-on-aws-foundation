/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const AWS = require('aws-sdk');
const axios = require('axios');
const moment = require('moment');


/**
 * Download Job Manifest file from s3 and update the source file info
*/
const writeManifest = async (bucket, manifestFile,jobDetails) => {
    
    let results = {};
    try {
        const s3 = new AWS.S3();
        /**
         * Download the settings file for S3
         */
        let manifest = await s3.getObject({
            Bucket: bucket,
            Key: manifestFile
        }).promise();
        manifest = JSON.parse(manifest.Body);
 
        if (jobDetails.detail) {
            /**
             * event is a newly submitted job to MediaConvert, creating a record
             * for the source file in the manifest file
             */
            console.log(`Writting input info for ${jobDetails.detail.jobId}`);
            manifest.Jobs.push({
                Id:jobDetails.detail.jobId,
                InputDetails: jobDetails.detail.inputDetails[0],
                InputFile: jobDetails.detail.inputDetails[0].uri
            });
        } else {
            /**
             * event is the processed outputs from a completed job in MediaConvert, 
             * updating the manifest file.
             */
             console.log(`Writting jobDetails for ${jobDetails.Id}`);
            const index = manifest.Jobs.findIndex(job => job.Id === jobDetails.Id);
            if (index === -1) {
                console.log(`no entry found for jobId: ${jobDetails.Id}, creating new entry`);
                jobDetails.InputDetails = {};
                manifest.Jobs.push(jobDetails);
                results = jobDetails;
            } else {
                results = {...manifest.Jobs[index], ...jobDetails};
                manifest.Jobs[index] = results;
            }
        }
        await s3.putObject({
            Bucket: bucket,
            Key: manifestFile,
            Body: JSON.stringify(manifest)
        }).promise();
    } catch (err) {
        throw {
            Message:'Failed to update the jobs-manifest.json, please check its accessible in the root of the source S3 bucket',
            Error: err,
            Job: jobDetails
        };
    }
    return results;
};


/**
 * Ge the Job details from MediaConvert and process the MediaConvert output details 
 * from Cloudwatch
*/
const processJobDetails = async (endpoint,cloudfrontUrl,data) => {
    console.log('Processing MediaConvert outputs');
    const buildUrl = (originalValue) => originalValue.slice(5).split('/').splice(1).join('/');
    const mediaconvert = new AWS.MediaConvert({
        endpoint: endpoint,
        customUserAgent: process.env.SOLUTION_IDENTIFIER
    });
    let jobDetails = {};
    
    try {
        const jobData = await mediaconvert.getJob({ Id: data.detail.jobId }).promise();
        
        jobDetails = {
            Id:data.detail.jobId,
            Job:jobData.Job,
            OutputGroupDetails: data.detail.outputGroupDetails,
            Outputs: {
                HLS_GROUP:[],
                DASH_ISO_GROUP:[],
                CMAF_GROUP:[],
                MS_SMOOTH_GROUP:[],
                FILE_GROUP:[],
                THUMB_NAILS:[]
            }
        };
        /**
         * Parse MediaConvert Output and generate CloudFront URLS.
        */
       data.detail.outputGroupDetails.forEach(output => {
        if (output.type != 'FILE_GROUP') {
            jobDetails.Outputs[output.type].push(`https://${cloudfrontUrl}/${buildUrl(output.playlistFilePaths[0])}`);
        } else {
            if (output.outputDetails[0].outputFilePaths[0].split('.').pop() === 'jpg') {
                jobDetails.Outputs.THUMB_NAILS.push(`https://${cloudfrontUrl}/${buildUrl(output.outputDetails[0].outputFilePaths[0])}`);
            } else {
                output.outputDetails.forEach(filePath => {
                    jobDetails.Outputs.FILE_GROUP.push(`https://${cloudfrontUrl}/${buildUrl( filePath.outputFilePaths[0])}`);
                });
            }
        }
    });
    /**
     * Cleanup any empty output groups
     */
    for (const output in jobDetails.Outputs) {
        if (jobDetails.Outputs[output] < 1) delete jobDetails.Outputs[output];
    }
    } catch (err) {
        throw err;
    }
     console.log(`JOB DETAILS:: ${JSON.stringify(jobDetails, null, 2)}`);
    return jobDetails;
};


/**
 * Send An sns notification for any failed jobs
 */
const sendSns = async (topic,stackName,status,data) => {
    const sns = new AWS.SNS({
        region: process.env.REGION
    });
    try {
        let id,msg;
        
        switch (status) {
            case 'COMPLETE':
                /**
                * reduce the data object just send Id,InputFile, Outputs
                */ 
                id = data.Id;
                msg = {
                    Id:data.Id,
                    InputFile: data.InputFile,
                    InputDetails: data.InputDetails,
                    Outputs: data.Outputs
                };
                break;
            case 'CANCELED':
            case 'ERROR':
                /**
                 * Adding CloudWatch log link for failed jobs
                 */
                id =  data.detail.jobId;
                msg = {
                    Details:`https://console.aws.amazon.com/mediaconvert/home?region=${process.env.AWS_REGION}#/jobs/summary/${id}`,
                    ErrorMsg: data
                };
                break;
            case 'PROCESSING ERROR':
                /**
                 * Edge case where processing the MediaConvert outputs fails.
                 */
                id = data.Job.detail.jobId || data.detail.jobId;
                msg = data;
                break;
        }
        console.log(`Sending ${status} SNS notification ${id}`);
        await sns.publish({
            TargetArn: topic,
            Message: JSON.stringify(msg, null, 2),
            Subject: `${stackName}: Job ${status} id:${id}`,
        }).promise();
    } catch (err) {
        throw err;
    }
    return;
};

/**
 * Remove any sensitive data from the job details and send metrics to
 * AWS Solution metrics API. This data is anonymous and helps us with our
 * roadmap fo the solution. 
 */
const sendMetrics = async (solutionId,version,uuid,results) => {
    try {
        let payload = {};
        payload.InputDetails = results.InputDetails;
        delete payload.InputDetails.uri;
        payload.Duration = results.Job.OutputGroupDetails[0].OutputDetails[0].DurationInMs;
        payload.Timing = results.Job.Timing;
        payload.Outputs = {
            FILE_GROUP_SETTINGS: [],
            HLS_GROUP_SETTINGS: [],
            DASH_ISO_GROUP_SETTINGS: [],
            CMAF_GROUP_SETTINGS: [],
            MS_SMOOTH_GROUP_SETTINGS: [],
        };
        results.Job.Settings.OutputGroups.forEach((group) => {
            group.Outputs.forEach((output) => {
                if (output.VideoDescription) {
                    payload.Outputs[group.OutputGroupSettings.Type].push(
                    output.VideoDescription.Height
                    );
                }
            });
        });
    
        const metrics = {
            Solution: solutionId,
            Version: version,
            UUID: uuid,
            TimeStamp: moment().utc().toISOString(),
            EventType:"JobComplete",
            EventData: payload
        };
        const params = {
            port: 443,
            method: 'post',
            url: 'https://metrics.awssolutionsbuilder.com/generic',
            headers: {
                'Content-Type': 'application/json'
            },
            data: metrics
        };
        console.log(`Sending Metrics: ${JSON.stringify(metrics,null,2)}`);
        await axios(params);
    } catch (err) {
        console.log(err);
    }
    return;
};



module.exports = {
    writeManifest:writeManifest,
    processJobDetails:processJobDetails,
    sendSns:sendSns,
    sendMetrics:sendMetrics
};