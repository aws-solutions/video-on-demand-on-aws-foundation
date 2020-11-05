/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const AWS = require('aws-sdk');

//AWS.config.logger = console;

/**
 *  Get MediaConvert API Endpoint for the account/region
*/
const getEndpoint = async () => {
    let endpoint;
    try {
        const mediaconvert = new AWS.MediaConvert();
        const data = await mediaconvert.describeEndpoints().promise();
        endpoint = data.Endpoints[0].Url;
    } catch (err) {
        throw err;
    }
    return endpoint;
};


module.exports = {
    getEndpoint: getEndpoint
};
