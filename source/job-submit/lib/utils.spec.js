/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const utils = require('./utils.js');

/**
 * setup
 */
const mockGetObject = jest.fn();
const mockCreateJob = jest.fn();
const mockPublish = jest.fn();

jest.mock('aws-sdk', () => {
    return {
        S3: jest.fn(() => ({
            getObject: mockGetObject,
        })),
        MediaConvert: jest.fn(() => ({
            createJob: mockCreateJob,
        })),
        SNS: jest.fn(() => ({
            publish: mockPublish,
        }))
    };
});
/**
 * Mock Data
 */
const s3Valid = {
    "Body": "{\n\"Settings\":{}\n}"
};
const s3Invalid = {
    "Body": "{\n\"Error\":{}\n}"
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
        "OutputGroups": [],
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
    beforeEach(() => {
        mockGetObject.mockReset();
    });
    it('GetJobSettings Success test', async () => {
        mockGetObject.mockImplementation(() => {
            return {
              promise() {
                return Promise.resolve(s3Valid);
              }
            };
        });
        await utils.getJobSettings();
    });
    it('GetJobSettings Success test', async () => {
        mockGetObject.mockImplementation(() => {
            return {
              promise() {
                return Promise.resolve(s3Invalid);
              }
            };
        });
        await utils.getJobSettings().catch(err => {
            expect(err.Error.toString()).toEqual('Error: Invalid settings file in s3')
        });
    });
    it('GetJobSettings Failed test', async () => {
        mockGetObject.mockImplementation(() => {
            return {
                promise() {
                    return Promise.reject('GET FAILED');
                }
            };
        });
        await utils.getJobSettings().catch(err => {
            expect(err.Error.toString()).toEqual('GET FAILED')
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
            expect(err.toString()).toEqual("Error: 'OutputGroupSettings.Type is not a valid type. Please check/test your job settings file.'");
        });
    });
});
describe('Utils CreateJob',() => {
    beforeEach(() => {
        mockCreateJob.mockReset();
    });
    it('CreateJob Success test', async () => {
        mockCreateJob.mockImplementation(() => {
            return {
              promise() {
                return Promise.resolve();
              }
            };
        });
        await utils.createJob('job','endpoint');
    });
    it('CreateJob Failed test', async () => {
        mockCreateJob.mockImplementation(() => {
            return {
                promise() {
                    return Promise.reject('JOB FAILED');
                }
            };
        });
        await utils.createJob('job','endpoint').catch(err => {
            expect(err.toString()).toEqual('JOB FAILED')
        });
    });
});
describe('Utils SendError',() => {
    beforeEach(() => {
        mockPublish.mockReset();
    });
    it('SendError Success test', async () => {
        mockPublish.mockImplementation(() => {
            return {
              promise() {
                return Promise.resolve();
              }
            };
        });
        await utils.sendError('topic','stackName','err');
    });
    it('SendError Failed test', async () => {
        mockPublish.mockImplementation(() => {
            return {
                promise() {
                    return Promise.reject('JOB FAILED');
                }
            };
        });
        await utils.sendError('topic','stackName','err').catch(err => {
            expect(err.toString()).toEqual('JOB FAILED')
        });
    });
});