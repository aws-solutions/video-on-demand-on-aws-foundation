/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const utils = require('./utils.js');
const { mockClient } = require("aws-sdk-client-mock");
const { 
    MediaConvertClient,
    CreateJobCommand
} = require("@aws-sdk/client-mediaconvert");
const { 
    S3Client,
    GetObjectCommand
} = require("@aws-sdk/client-s3");
const { 
    SNSClient,
    PublishCommand
} = require("@aws-sdk/client-sns");

/**
 * setup
 */
const mediaConvertClientMock = mockClient(MediaConvertClient);
const s3ClientMock = mockClient(S3Client);
const snsClientMock = mockClient(SNSClient);

/**
 * Mock Data
 */
const s3Valid = {
    "Body": {
        transformToString: () => ("{\n\"Settings\":{}\n}")
    }
};
const s3Invalid = {
    "Body": {
        transformToString: () => ("{\n\"Error\":{}\n}")
    }
};

const validSettings = {
    "Role": "",
    "Settings": {
        "OutputGroups": [
            {
                "CustomName":"Custom1",
                "OutputGroupSettings": {
                    "Type": "FILE_GROUP_SETTINGS",
                    "FileGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/mp4/"
                    }
                }
            },
            {
                "Name": "File Group",
                "OutputGroupSettings": {
                    "Type": "FILE_GROUP_SETTINGS",
                    "FileGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/mp4/"
                    }
                }
            },
            {
                "Name": "Apple HLS",
                "OutputGroupSettings": {
                    "Type": "HLS_GROUP_SETTINGS",
                    "HlsGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/hls/",
                    }
                }
            },
            {
                "Name": "Apple HLS",
                "CustomName":"Custom",
                "OutputGroupSettings": {
                    "Type": "HLS_GROUP_SETTINGS",
                    "HlsGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/hls/",
                    }
                }
            },
            {
                "Name": "MS_SMOOTH",
                "OutputGroupSettings": {
                    "Type": "MS_SMOOTH_GROUP_SETTINGS",
                    "MsSmoothGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/mss/",
                    }
                }
            },
            {
                "Name": "MS_SMOOTH",
                "CustomName":"Custom2",
                "OutputGroupSettings": {
                    "Type": "MS_SMOOTH_GROUP_SETTINGS",
                    "MsSmoothGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/mss/",
                    }
                }
            },
            {
                "Name": "CMAF_GROUP",
                "OutputGroupSettings": {
                    "Type": "CMAF_GROUP_SETTINGS",
                    "CmafGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/cmaf/",
                    }
                }
            },            {
                "Name": "CMAF_GROUP",
                "CustomName":"Custom3",
                "OutputGroupSettings": {
                    "Type": "CMAF_GROUP_SETTINGS",
                    "CmafGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/cmaf/",
                    }
                }
            },
            {
                "Name": "DASH ISO",
                "CustomName":"Custom4",
                "OutputGroupSettings": {
                    "Type": "DASH_ISO_GROUP_SETTINGS",
                    "DashIsoGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/dash/",
                    }
                }
            },
            {
                "Name": "DASH ISO",
                "OutputGroupSettings": {
                    "Type": "DASH_ISO_GROUP_SETTINGS",
                    "DashIsoGroupSettings": {
                        "Destination": "s3://destinationbucket/guid/dash/",
                    }
                }
            }
        ],
        "Inputs": [
            {
                "FileInput": "s3://sourcebucket/assets01/test.mp4"
            }
        ]
    }
};
const inValidSettings = {
    "Role": "",
    "Settings": {
        "OutputGroups": [{
            OutputGroupSettings: {
                Type: "invalid",
            }
        }],
        "Inputs": [
            {
                "FileInput": "s3://sourcebucket/assets01/test.mp4"
            }
        ]
    }
};
/**
 * Tests
 */
describe('Utils GetJobSettings',() => {
    it('GetJobSettings Success test', async () => {
        s3ClientMock.on(GetObjectCommand).resolves(s3Valid);
        await utils.getJobSettings();
    });
    it('GetJobSettings Invalid test', async () => {
        s3ClientMock.on(GetObjectCommand).resolves(s3Invalid);
        await utils.getJobSettings().catch(err => {
            expect(err.Error.toString()).toEqual('Error: Invalid settings file in s3')
        });
    });
    it('GetJobSettings Failed test', async () => {
        s3ClientMock.on(GetObjectCommand).rejects('GET FAILED');
        await utils.getJobSettings().catch(err => {
            expect(err.Error.toString()).toEqual('Error: GET FAILED')
            expect(err.message).toEqual('Failed to download and validate the job-settings.json file. Please check its contents and location. Details  on using custom settings: https://github.com/awslabs/video-on-demand-on-aws-foundations');
        });
    });
});
describe('Utils UpdateJobSettings',() => {
    it('UpdateJobSettings Success test', async () => {
        await utils.updateJobSettings(validSettings,'inputPath','outputPath',{},'role', (res) => {
            expect(res.Role).toEqual('role');
        });
    });
    it('UpdateJobSettings Failed test', async () => {
        await utils.updateJobSettings(inValidSettings,'inputPath','outputPath',{},'role').catch(err => {
            expect(err.toString()).toEqual("Error: Failed to update the job-settings.json file. Details on using custom settings: https://github.com/awslabs/video-on-demand-on-aws-foundations");
            expect(err.Error).toEqual('Error: OutputGroupSettings.Type is not a valid type. Please check your job settings file.');
        });
    });
});
describe('Utils CreateJob',() => {
    it('CreateJob Success test', async () => {
        mediaConvertClientMock.on(CreateJobCommand).resolves();
        await utils.createJob('job','endpoint');
    });
    it('CreateJob Failed test', async () => {
        mediaConvertClientMock.on(CreateJobCommand).rejects('JOB FAILED');
        await utils.createJob('job','endpoint').catch(err => {
            expect(err.toString()).toEqual('Error: JOB FAILED')
        });
    });
});
describe('Utils SendError',() => {
    it('SendError Success test', async () => {
        snsClientMock.on(PublishCommand).resolves();
        await utils.sendError('topic','stackName','err');
    });
    it('SendError Failed test', async () => {
        snsClientMock.on(PublishCommand).rejects('JOB FAILED');
        await utils.sendError('topic','stackName','err').catch(err => {
            expect(err.toString()).toEqual('Error: JOB FAILED')
        });
    });
});