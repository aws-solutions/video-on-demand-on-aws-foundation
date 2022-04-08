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
        // Split platform folder 
        const platformFolderArr = srcVideo.split("/");
        // Job settings for specific platform
        const settingsFile = `${platformFolderArr[0]}/${platformFolderArr[1]}/${JOB_SETTINGS}`;
        const guid = uuidv4();
        const inputPath = `s3://${srcBucket}/${srcVideo}`;
        // Get output folder directory from platform
        const outputFolderDir = platformFolderArr.slice(0, -1);
        // Specify platform directory to vod destination folder
        const platformDir = outputFolderDir.join('/').replace(/, ([^,]*)$/);
        const outputPath = `s3://${DESTINATION_BUCKET}/${platformDir}/${guid}`;
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
