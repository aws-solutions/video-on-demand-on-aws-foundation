/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
// Example identifier. 'AwsSolution/SO0052/v1.0.0'

const options = { customUserAgent: process.env.SOLUTION_IDENTIFIER };
const AWS = require('aws-sdk');
const fs = require('fs');

//AWS.config.logger = console;

/**
 * Create Default configuration in the source S3 bucket
*/
const setDefaults = async (bucket) => {
    console.log('creating files')
    try {
        const s3 = new AWS.S3(options);
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
        const s3 = new AWS.S3(options);

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
                    },
                    {
                        Events: ['s3:ObjectCreated:*'],
                        LambdaFunctionArn: lambdaArn,
                        Filter: {
                            Key: {
                                FilterRules: [{
                                    Name: 'suffix',
                                    Value: '.m2t'
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
                                    Value: '.mxf'
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
                                    Value: '.mkv'
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
                                    Value: '.m3u8'
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
                                    Value: '.mpeg'
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
                                    Value: '.webm'
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
                                    Value: '.h264'
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
                                    Value: '.MPG'
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
                                    Value: '.MP4'
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
                                    Value: '.M4V'
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
                                    Value: '.MOV'
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
                                    Value: '.M2TS'
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
                                    Value: '.WMV'
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
                                    Value: '.MXF'
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
                                    Value: '.MKV'
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
                                    Value: '.M3U8'
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
                                    Value: '.MPEG'
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
                                    Value: '.WEBM'
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
                                    Value: '.H264'
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
