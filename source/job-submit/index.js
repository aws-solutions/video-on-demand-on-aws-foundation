/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const uuidv4 = require("uuid/v4");
const utils = require("./lib/utils.js");
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  console.log(context.LogGroupName);
  console.log(`REQUEST:: ${JSON.stringify(event, null, 2)}`);
  const {
    MEDIACONVERT_ENDPOINT,
    MEDIACONVERT_ROLE,
    JOB_SETTINGS,
    DESTINATION_BUCKET,
    SOLUTION_ID,
    STACKNAME,
  } = process.env;

  /**
   * Get the metadata of the s3 object.
   *
   * In order for the stack to work correctly, the source video must have the following user-defined metadata:
   * - "app-id": the id of the app associated with the interview recording
   * - "workspace": the relevant workspace for the interview recording
   *
   * If these are present, the job-complete lambda will update the relevant interview recording object
   * in Rails with the URL of the processed video.
   */
  const s3 = new AWS.S3();
  const params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key,
  };
  const data = await s3.headObject(params).promise();
  const videoMetadata = !data ? null : data.Metadata;

  try {
    /**
     * define inputs/ouputs and a unique string for the mediaconvert output path in S3.
     */
    console.log(event);
    const srcVideo = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );
    const srcBucket = decodeURIComponent(event.Records[0].s3.bucket.name);
    const settingsFile = `${srcVideo.split("/")[0]}/${JOB_SETTINGS}`;
    const guid = uuidv4();
    const inputPath = `s3://${srcBucket}/${srcVideo}`;
    const outputPath = `s3://${DESTINATION_BUCKET}/${guid}`;
    const metaData = {
      Guid: guid,
      StackName: STACKNAME,
      SolutionId: SOLUTION_ID,
      ...videoMetadata,
    };
    /**
     * download and validate settings
     */
    let job = await utils.getJobSettings(srcBucket, settingsFile);
    /**
     * parse settings file to update source / destination
     */
    job = await utils.updateJobSettings(
      job,
      inputPath,
      outputPath,
      metaData,
      MEDIACONVERT_ROLE
    );
    /**
     * Submit Job
     */
    await utils.createJob(job, MEDIACONVERT_ENDPOINT);
  } catch (err) {
    /**
     * Send Slack error message
     */
    await utils.sendError(context.logGroupName, err);
    throw err;
  }
  return;
};
