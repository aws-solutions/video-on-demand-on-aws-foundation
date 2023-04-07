/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const axios = require("axios");
const cfn = require("./index.js");

const event = {
  RequestType: "Create",
  ServiceToken: "arn:aws:lambda",
  ResponseURL: "https://cloudformation",
  StackId: "arn:aws:cloudformation",
  RequestId: "63e8ffa2-3059-4607-a450-119d473c73bc",
  LogicalResourceId: "Uuid",
  ResourceType: "Custom::UUID",
  ResourceProperties: {
    ServiceToken: "arn:aws:lambda",
    Resource: "abc",
  },
};
const context = {
  logStreamName: "cloudwatch",
};
const responseStatus = "ok";
const responseData = {
  test: "testing",
};

jest.mock("axios");

describe("#CFN RESONSE::", () => {
  /**
   * mock the axios.put success with jest and then call sendResonse, should return the status (200)
   */
  it('should return "200" on a send cfn response sucess', async () => {
    axios.mockResolvedValue({
      status: 200,
    });
    await cfn.sendResponse(
      event,
      context,
      responseStatus,
      responseData,
      (res) => {
        expect(res).toEqual(200);
      }
    );
  });
  /**
   * mock mock the axios.put failure with jest and then call sendResonse, should return the status (200)
   */
  it('should throw "NetworkError" on a send cfn response fail', async () => {
    axios.mockRejectedValue(new Error("NetworkError"));
    await cfn
      .sendResponse(event, context, responseStatus, responseData)
      .catch((err) => {
        expect(err.toString()).toEqual("Error: NetworkError");
      });
  });
});
