/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const index = require("./index.js");
/**
 * setup
 */
const mockDescribeEndpoints = jest.fn();
jest.mock("aws-sdk", () => {
  return {
    MediaConvert: jest.fn(() => ({
      describeEndpoints: mockDescribeEndpoints,
    })),
  };
});
/**
 * Tests
 */
describe("GetEndPoint", () => {
  beforeEach(() => {
    mockDescribeEndpoints.mockReset();
  });
  it("Decribe Endpoints Success test", async () => {
    mockDescribeEndpoints.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve({
            Endpoints: [
              {
                Url: "https://mediaconvert",
              },
            ],
          });
        },
      };
    });
    await index.getEndpoint((res) => {
      expect(res).toEqual("https://mediaconvert");
    });
  });
  it("Describe Endpoints Failed test", async () => {
    mockDescribeEndpoints.mockImplementation(() => {
      return {
        promise() {
          return Promise.reject("Describe endpoint Failed");
        },
      };
    });
    await index.getEndpoint().catch((err) => {
      expect(err.toString()).toEqual("Describe endpoint Failed");
    });
  });
});
