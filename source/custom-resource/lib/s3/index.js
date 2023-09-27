/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
// Example identifier. 'AwsSolution/SO0052/v1.0.0'

const options = { customUserAgent: process.env.SOLUTION_IDENTIFIER };
const { S3 } = require("@aws-sdk/client-s3");
const fs = require('fs');


/**
 * Create Default configuration in the source S3 bucket
*/
const setDefaults = async (bucket) => {
    console.log('creating files')
    try {
        const s3 = new S3(options);
        await s3.putObject({
            Body: fs.readFileSync('./lib/s3/job-settings.json', 'utf8'),
            Bucket: bucket,
            Key: 'assets01/job-settings.json'
        });
        await s3.putObject({
            Body:"{\n\"Jobs\": []\n}",
            Bucket: bucket,
            Key: 'jobs-manifest.json'
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
    console.log('creating files complete')
};

/**
 * 
 * Helper function to create S3 ObjectCreated event handler
 * 
 * @param {string} lambdaArn - ARN of the Lambda function to be invoked
 * @param {string} suffix  - Object suffix to filter event
 * @returns 
 */
const getS3ObjectCreatedHandlerConfig = (lambdaArn, suffix) => ({
    Events: ['s3:ObjectCreated:*'],
    LambdaFunctionArn: lambdaArn,
    Filter: {
        Key: {
            FilterRules: [{
                Name: 'suffix',
                Value: suffix
            }]
        }
    }
})

/**
 * Add event notifications to the source S3 bucket
*/
const putNotification = async (bucket, lambdaArn) => {

    try {
        const s3 = new S3(options);

        const suffixList = [
            '.mpg',
            '.mp4',
            '.m4v',
            '.mov',
            '.m2ts',
            '.wmv',
            '.mxf',
            '.mkv',
            '.m3u8',
            '.mpeg',
            '.webm',
            '.h264',
        ];

        await s3.putBucketNotificationConfiguration({
            Bucket: bucket,
            NotificationConfiguration: {
                LambdaFunctionConfigurations: suffixList.map(suffix => ([
                    getS3ObjectCreatedHandlerConfig(lambdaArn, suffix),
                    getS3ObjectCreatedHandlerConfig(lambdaArn, suffix.toUpperCase()),
                ])).flat(),
            }
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports = {
    setDefaults: setDefaults,
    putNotification:putNotification
};
