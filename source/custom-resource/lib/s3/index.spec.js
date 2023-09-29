/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const index = require('./index.js');
const { mockClient } = require("aws-sdk-client-mock");
const { 
    S3Client, 
    PutBucketNotificationConfigurationCommand,
    PutObjectCommand
} = require("@aws-sdk/client-s3");
/**
 * setup
 */
const s3ClientMock = mockClient(S3Client);

/**
 * Tests
 */
describe('S3 PutObject',() => {
    it('S3 Put Success test', async () => {
        s3ClientMock.on(PutObjectCommand).resolves();
        await index.setDefaults();
    });
    it('S3 Put Failed test', async () => {
        s3ClientMock.on(PutObjectCommand).rejects('PUT FAILED');
        await index.setDefaults().catch(err => {
            expect(err.toString()).toEqual('Error: PUT FAILED')
        });
    });
});
describe('S3 Put Bucket Notification',() => {
    it('S3 Put Notification success test', async () => {
        s3ClientMock.on(PutBucketNotificationConfigurationCommand).resolves();
        await index.putNotification();
    });
    it('S3 Bucket Notification Failed test', async () => {
        s3ClientMock.on(PutBucketNotificationConfigurationCommand).rejects('PUT FAILED');
        await index.putNotification().catch(err => {
            expect(err.toString()).toEqual('Error: PUT FAILED')
        });
    });
});
