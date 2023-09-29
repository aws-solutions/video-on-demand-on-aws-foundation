/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const index = require('./index.js');
const { mockClient } = require("aws-sdk-client-mock");
const {
    MediaConvertClient,
    DescribeEndpointsCommand
} = require("@aws-sdk/client-mediaconvert");

const describeEndpointsData = {
    Endpoints: [
        {
            Url: 'https://mediaconvert'
        }
    ]
};

/**
 * Tests
 */
describe('GetEndPoint',() => {
    const mediaConvertClientMock = mockClient(MediaConvertClient);
    
    it('Decribe Endpoints Success test', async () => {
        mediaConvertClientMock.on(DescribeEndpointsCommand).resolves(describeEndpointsData);
        await index.getEndpoint((res) => {
            expect(res).toEqual(describeEndpointsData.Endpoints[0].Url);
        });
    });
    it('Describe Endpoints Failed test', async () => {
        mediaConvertClientMock.on(DescribeEndpointsCommand).rejects('Describe endpoint Failed');
        await index.getEndpoint().catch(err => {
            expect(err.toString()).toEqual('Error: Describe endpoint Failed')
        });
    });
});
