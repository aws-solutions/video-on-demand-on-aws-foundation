/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
// Example identifier. 'AwsSolution/SO0052/v1.0.0'

const options = { customUserAgent: process.env.SOLUTION_IDENTIFIER };
const { MediaConvert } = require("@aws-sdk/client-mediaconvert");


/**
 *  Get MediaConvert API Endpoint for the account/region
*/
const getEndpoint = async () => {
    let endpoint;
    try {
        const mediaconvert = new MediaConvert(options);
        const data = await mediaconvert.describeEndpoints({MaxResults: 1});
        endpoint = data.Endpoints[0].Url;
    } catch (err) {
        console.error(err);
        throw err;
    }
    return endpoint;
};


module.exports = {
    getEndpoint: getEndpoint
};
