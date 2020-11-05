/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const uuidv4 = require('uuid/v4');
const utils = require('./lib/utils.js');

exports.handler = async (event,context) => {
    console.log(context.LogGroupName);
    console.log(`REQUEST:: ${JSON.stringify(event, null, 2)}`);
    const {
        MEDIACONVERT_ENDPOINT,
        MEDIACONVERT_ROLE,
        JOB_SETTINGS,
        DESTINATION_BUCKET,
        SOLUTION_ID,
        STACKNAME,
        SNS_TOPIC_ARN
    } = process.env;
    
    try {
        /**
         * define inputs/ouputs and a unique string for the mediaconver output path in S3. 
         */
        console.log(event);
        const srcVideo = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
        const srcBucket = decodeURIComponent(event.Records[0].s3.bucket.name);
        const settingsFile = `${srcVideo.split("/")[0]}/${JOB_SETTINGS}`;
        const guid = uuidv4();
        const inputPath = `s3://${srcBucket}/${srcVideo}`;
        const outputPath = `s3://${DESTINATION_BUCKET}/${guid}`;
        const metaData = {
            Guid:guid,
            StackName:STACKNAME,
            SolutionId:SOLUTION_ID
        };
        /**
         * download and validate settings 
         */
        let job = await utils.getJobSettings(srcBucket,settingsFile);
        /**
         * parse settings file to update source / destination
         */
        job = await utils.updateJobSettings(job,inputPath,outputPath,metaData,MEDIACONVERT_ROLE);
        /**
         * Submit Job
         */
        await utils.createJob(job,MEDIACONVERT_ENDPOINT);

    } catch (err) {
        /**
         * Send SNS error message
         */
        await utils.sendError(SNS_TOPIC_ARN,STACKNAME,context.logGroupName,err);
        throw err;
    }
    return;
};
