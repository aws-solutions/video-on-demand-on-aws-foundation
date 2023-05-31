/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const { v4: uuidv4} = require('uuid');
const mediaconvert = require('./lib/mediaconvert');
const s3 = require('./lib/s3');
const cfn = require('./lib/cfn');

exports.handler = async (event, context) => {
    console.log(`REQUEST:: ${JSON.stringify(event, null, 2)}`);
    let responseData = {};
    try {
        if (event.RequestType === 'Create') {
            if (event.LogicalResourceId === 'Endpoint') {
                try  {
                    /**
                    * Create UUID for the stack creation. this is used by AWS for annomous metrics
                    */
                    responseData.UUID = uuidv4();
                    /**
                    * Get the API endpoint for mediaconvert
                    */
                    responseData.Endpoint = await mediaconvert.getEndpoint();
                } catch (err) {
                    throw err;
                }
            } else if (event.LogicalResourceId === 'S3Config') {
                try  {
                    const { SourceBucket, LambdaArn } = event.ResourceProperties;
                    /**
                    * Upload the default job settings file to S3
                    */
                    await s3.setDefaults(SourceBucket);
                    /**
                     * Set S3 event notification on the source S3 bucket to trigger the job Submint
                     * Lambda function.
                     */
                    await s3.putNotification(SourceBucket,LambdaArn);
                } catch (err) {
                    throw err;
                }
            }
        } else {
            console.log('No action required for update or delete');
        }
        await cfn.sendResponse(event, context, 'SUCCESS', responseData);
        console.log(`RESPONSE:: ${JSON.stringify(responseData, null, 2)}`);
    } catch (err) {
        console.error(JSON.stringify(err, null, 2));
        await cfn.sendResponse(event, context, 'FAILED');
    }
};

