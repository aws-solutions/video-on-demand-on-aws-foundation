/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const axios = require("axios");

/**
 * CFN Response function to return status and responseData to CloudFormation
 */
const sendResponse = async (event, context, responseStatus, responseData) => {
  let data;

  try {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason:
        "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: event.LogicalResourceId,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });

    const params = {
        url: event.ResponseURL,
        method: "put",
        port: 443,
        headers: {
            "content-type": "",
            "content-length": responseBody.length,
        },
        data: responseBody,
    };

        data = await axios(params);
    } catch (err) {
        throw err;
    }
    return data.status;
};

module.exports = {
    sendResponse: sendResponse,
};
