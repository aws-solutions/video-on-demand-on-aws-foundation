/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const axios = require("axios");
const utils = require("./utils.js");
const test = require("./utils.test.js");
/**
 * setup
 */
const mockGetObject = jest.fn();
const mockPutObject = jest.fn();
const mockSnsPublish = jest.fn();
const mockGetJob = jest.fn();
jest.mock("aws-sdk", () => {
  return {
    S3: jest.fn(() => ({
      getObject: mockGetObject,
      putObject: mockPutObject,
    })),
    SNS: jest.fn(() => ({
      publish: mockSnsPublish,
    })),
    MediaConvert: jest.fn(() => ({
      getJob: mockGetJob,
    })),
  };
});
jest.mock("axios");
/**
 * Test
 */
describe("Utils WriteManifest", () => {
  beforeEach(() => {
    mockGetObject.mockReset();
    mockPutObject.mockReset();
  });
  it("writeManifest Input Success test", async () => {
    mockGetObject.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve({
            Body: '{\n"Jobs": []\n}',
          });
        },
      };
    });
    mockPutObject.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    let data = {
      detail: {
        jobId: "123",
        inputDetails: [
          {
            uri: "uri",
          },
        ],
      },
    };
    await utils.writeManifest("bucket", "manifestFile", data);
  });
  it("writeManifest Job Success test", async () => {
    mockGetObject.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve({
            Body: '{\n"Jobs":[\n{\n"Id":"123",\n"Input":{}\n}\n]\n}',
          });
        },
      };
    });
    mockPutObject.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    let data = { jobId: "123", Outputs: {} };
    await utils.writeManifest("bucket", "manifestFile", data);
  });
  it("writeManifest Failed test", async () => {
    mockGetObject.mockImplementation(() => {
      return {
        promise() {
          return Promise.reject("GET FAILED");
        },
      };
    });
    await utils.writeManifest("bucket", "manifestFile", "data").catch((err) => {
      expect(err.Error.toString()).toEqual("GET FAILED");
    });
  });
});
describe("Utils ProcessOutputs", () => {
  beforeEach(() => {
    mockGetJob.mockReset();
  });
  it("ProcessOutputs Success test", async () => {
    mockGetJob.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve({});
        },
      };
    });
    await utils.processJobDetails(
      "endpoint",
      "cloudfrontUrl",
      test.cwComplete,
      (res) => {
        expect(res.Id).toEqual("12345");
      }
    );
  });
  it("ProcessOutputs Failed test", async () => {
    mockGetJob.mockImplementation(() => {
      return {
        promise() {
          return Promise.reject("GET JOB FAILED");
        },
      };
    });
    await utils
      .processJobDetails("endpoint", "cloudfrontUrl", test.cwComplete)
      .catch((err) => {
        expect(err.toString()).toEqual("GET JOB FAILED");
      });
  });
});

describe("Utils SendSns", () => {
  beforeEach(() => {
    mockSnsPublish.mockReset();
  });
  it("SendSns Success test", async () => {
    mockSnsPublish.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    await utils.sendSns("topic", "stackName", "COMPLETE", test.snsData);
  });
  it("SendSns Success test", async () => {
    mockSnsPublish.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    await utils.sendSns("topic", "stackName", "PROCESSING ERROR", test.snsData);
  });
  it("SendSns Failed test", async () => {
    mockSnsPublish.mockImplementation(() => {
      return {
        promise() {
          return Promise.reject("SEND FAILED");
        },
      };
    });
    await utils.sendSns("topic", "stackName", "ERROR", test.snsData).catch((err) => {
      expect(err.toString()).toEqual("SEND FAILED");
    });
  });
});

describe("Utils SendMetrics::", () => {
  it('should return "200" on a send metrics response sucess', async () => {
    axios.mockResolvedValue({
      status: 200,
    });
    await utils.sendMetrics("solutionId","version", "uuid", test.metricsData);
  });
  it('should throw "NetworkError" on a send metrics response fail', async () => {
    axios.mockRejectedValue(new Error("NetworkError"));
    await utils.sendMetrics("solutionId","version", "uuid", test.metricsData).catch((err) => {
      expect(err.toString()).toEqual("Error: NetworkError");
    });
  });
});
