/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const axios = require("axios");
const utils = require("./utils.js");
const test = require("./utils.test.js");
const { mockClient } = require("aws-sdk-client-mock");
const { 
    MediaConvertClient,
    GetJobCommand
} = require("@aws-sdk/client-mediaconvert");
const { 
    S3Client,
    GetObjectCommand,
    PutObjectCommand
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
jest.mock("axios");

/**
 * Mock Data
 */
const emptyJobsData = {
  "Body": {
    transformToString: () => ('{\n"Jobs": []\n}')
  }
};
const jobsData = {
  "Body": {
    transformToString: () => ('{\n"Jobs":[\n{\n"Id":"123",\n"Input":{}\n}\n]\n}')
  }
};

/**
 * Test
 */
describe("Utils WriteManifest", () => {
  it("writeManifest Input Success test", async () => {
    s3ClientMock.on(GetObjectCommand).resolves(emptyJobsData);
    s3ClientMock.on(PutObjectCommand).resolves();
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
    s3ClientMock.on(GetObjectCommand).resolves(jobsData);
    let data = { jobId: "123", Outputs: {} };
    await utils.writeManifest("bucket", "manifestFile", data);
  });
  it("writeManifest Failed test", async () => {
    s3ClientMock.on(GetObjectCommand).rejects("GET FAILED");
    await utils.writeManifest("bucket", "manifestFile", "data").catch((err) => {
      expect(err.Error.toString()).toEqual("Error: GET FAILED");
      expect(err.message).toEqual('Failed to update the jobs-manifest.json, please check its accessible in the root of the source S3 bucket');
      expect(err.Job).toEqual('data');;
    });
  });
});
describe("Utils ProcessOutputs", () => {
  it("ProcessOutputs Success test", async () => {
    mediaConvertClientMock.on(GetJobCommand).resolves({});
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
    mediaConvertClientMock.on(GetJobCommand).rejects("GET JOB FAILED");
    await utils
      .processJobDetails("endpoint", "cloudfrontUrl", test.cwComplete)
      .catch((err) => {
        expect(err.toString()).toEqual("Error: GET JOB FAILED");
      });
  });
});

describe("Utils SendSns", () => {
  it("SendSns Success test", async () => {
    snsClientMock.on(PublishCommand).resolves();
    await utils.sendSns("topic", "stackName", "COMPLETE", test.snsData);
  });
  it("SendSns Success test", async () => {
    await utils.sendSns("topic", "stackName", "PROCESSING ERROR", test.snsData);
  });
  it("SendSns Failed test", async () => {
    snsClientMock.on(PublishCommand).rejects("SEND FAILED");
    await utils.sendSns("topic", "stackName", "ERROR", test.snsData).catch((err) => {
      expect(err.toString()).toEqual("Error: SEND FAILED");
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
