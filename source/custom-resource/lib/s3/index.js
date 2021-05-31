/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const AWS = require('aws-sdk');
const fs = require('fs');

//AWS.config.logger = console;

/**
 * Create Default configuration in the source S3 bucket
*/
const setDefaults = async (bucket) => {
    console.log('creating files')
    try {
        const s3 = new AWS.S3();
        await s3.putObject({
            Body: fs.readFileSync('./lib/s3/job-settings.json', 'utf8'),
            Bucket: bucket,
            Key: 'assets01/job-settings.json'
        }).promise();
        await s3.putObject({
            Body:"{\n\"Jobs\": []\n}",
            Bucket: bucket,
            Key: 'jobs-manifest.json'
        }).promise();
    } catch (err) {
        throw err;
    }
    console.log('creating files complete')
    return;
};

/**
 * Add event notifications to the source S3 bucket
*/
const putNotification = async (bucket,lambdaArn) => {

    try {
        const s3 = new AWS.S3();

        await s3.putBucketNotificationConfiguration({
            Bucket: bucket,
            NotificationConfiguration: {
                LambdaFunctionConfigurations: [
                    {
                        Events: ['s3:ObjectCreated:*'],
                        LambdaFunctionArn: lambdaArn,
                        Filter: {
                            Key: {
                                FilterRules: [{
                                    Name: 'suffix',
                                    Value: '.mpg'
                                }]
                            }
                        }
                    },
                    {
                        Events: ['s3:ObjectCreated:*'],
                        LambdaFunctionArn: lambdaArn,
                        Filter: {
                            Key: {
                                FilterRules: [{
                                    Name: 'suffix',
                                    Value: '.mp4'
                                }]
                            }
                        }
                    },
                    {
                        Events: ['s3:ObjectCreated:*'],
                        LambdaFunctionArn: lambdaArn,
                        Filter: {
                            Key: {
                                FilterRules: [{
                                    Name: 'suffix',
                                    Value: '.m4v'
                                }]
                            }
                        }
                    },
                    {
                        Events: ['s3:ObjectCreated:*'],
                        LambdaFunctionArn: lambdaArn,
                        Filter: {
                            Key: {
                                FilterRules: [{
                                    Name: 'suffix',
                                    Value: '.wmv'
                                }]
                            }
                        }
                    },
                    {
                        Events: ['s3:ObjectCreated:*'],
                        LambdaFunctionArn: lambdaArn,
                        Filter: {
                            Key: {
                                FilterRules: [{
                                    Name: 'suffix',
                                    Value: '.mov'
                                }]
                            }
                        }
                    },
                    {
                        Events: ['s3:ObjectCreated:*'],
                        LambdaFunctionArn: lambdaArn,
                        Filter: {
                            Key: {
                                FilterRules: [{
                                    Name: 'suffix',
                                    Value: '.m2ts'
                                }]
                            }
                        }
                    }
                ]
            }
        }).promise();
    } catch (err) {
        throw err;
    }
    return;
};


module.exports = {
    setDefaults: setDefaults,
    putNotification:putNotification
};