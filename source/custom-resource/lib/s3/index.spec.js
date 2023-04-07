/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const index = require("./index.js");
/**
 * setup
 */
const mockPutObject = jest.fn();
const mockNotification = jest.fn();
const mockAddPermissions = jest.fn();

jest.mock("aws-sdk", () => {
  return {
    S3: jest.fn(() => ({
      putObject: mockPutObject,
      putBucketNotificationConfiguration: mockNotification,
    })),
    Lambda: jest.fn(() => ({
      addPermission: mockAddPermissions,
    })),
  };
});
/**
 * Tests
 */
describe("S3 PutObject", () => {
  beforeEach(() => {
    mockPutObject.mockReset();
  });
  it("S3 Put Success test", async () => {
    mockPutObject.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    await index.setDefaults();
  });
  it("S3 Put Failed test", async () => {
    mockPutObject.mockImplementation(() => {
      return {
        promise() {
          return Promise.reject("PUT FAILED");
        },
      };
    });
    await index.setDefaults().catch((err) => {
      expect(err.toString()).toEqual("PUT FAILED");
    });
  });
});
describe("S3 Put Bucket Notification", () => {
  beforeEach(() => {
    mockPutObject.mockReset();
    mockAddPermissions.mockReset();
  });
  it("S3 Put Notification success test", async () => {
    mockNotification.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    mockAddPermissions.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    await index.putNotification();
  });
  it("S3 Bucket Notification Failed test", async () => {
    mockAddPermissions.mockImplementation(() => {
      return {
        promise() {
          return Promise.resolve();
        },
      };
    });
    mockNotification.mockImplementation(() => {
      return {
        promise() {
          return Promise.reject("PUT FAILED");
        },
      };
    });
    await index.putNotification().catch((err) => {
      expect(err.toString()).toEqual("PUT FAILED");
    });
  });
});
