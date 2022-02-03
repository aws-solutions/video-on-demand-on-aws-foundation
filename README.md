# Colourbox Streaming

### IMPORTANT NOTE:
This project creates cloudfront for supplied bucket along with caching policy ect. All it requires is a DNS entry to point to the created cloudformation stack
## Overview
The project is based off of a Video-On-Demand architecture builds [by AWS](https://aws.amazon.com/solutions/implementations/video-on-demand-on-aws/) which provides the base infrastructure in a CDK-compliant project on to which the streaming service is build.

The API puts a message into a SQS queue which eventually results in the HLS files being put in a destination bucket, triggering a callback to the API containing the same identifier as the API initially provided with the SQS message.

### Configuration
`/source/cdk/cdk.json` has config for both production (main) and beta (development)
### Colourbox API
The API interacts through both SQS messaging and API-gateways (subtitle management / deletion of streams)
### Plugging
The project is source/destination agnostic in the sense that both the bucket that holds the raw files and the final output bucket are provided as part of the configuration. This made it easy to swap from the previous existing solution without any downtime.
#### Custom origin
Expected to be plovpenninge
#### Custom destination
Can be whatever, current setup runs with the original streaming-solution output bucket.

## Building and Bootstrapping
(Ran from context of the source/cdk folder)
 - cdk bootstrap (only needed on first run)
 - cdk deploy
Note: using this directly is discouraged, use the normal git-procedure and rely on CICD setup instead.

## Parts
`streaming-immutable-development`:

Contains items that the CDK deploy doesn't like to attempt to redeploy. As such this is excluded from the pipeline but may become an unnecessary part in the future.

`streaming-defaults-development`:

The [original AWS CDK project](https://github.com/awslabs/video-on-demand-on-aws-foundations) that was forked and adapted. Try to keep changes to this at a minimum to ease upstream merges. This basically contains the entire flow of moving a file from a folder, converting and moving result to a final cloudfront-backed destination folder.

`streaming-custom-development`:

Contains all the custom additions used to communicate between the API and the default-solution a long with subtitles, cleanup and more.

## Taking down the stack
Just like any cloudformation project, removing the project will remove all components. Storage is usually persisted and "orphaned" after delete, unless the component has its lifecycle specifically configured to die (and delete content) with the stack.
### Custom services
Application has from AWS-authors 2 custom-resource-backed lambdas.
These currently (2021-08-26) don't include support for their own teardown, so their deletion processes will hang (time out after 1 hour) and the deletion will fail. To fix this, follow this: https://www.youtube.com/watch?v=hlJkMoCxR-I

## Running test-version for debugging
```
-c destination_bucket_name=claus-destination
-c api_host=claus-api.cbx.xyz
-c stream_host=https://dpv7mez7ofol6.cloudfront.net
```
`
cdk deploy -c destination_bucket_name=claus-destination -c api_host=claus-api.cbx.xyz stream_host=https://dpv7mez7ofol6.cloudfront.net --all
cdk synth -c destination_bucket_name=claus-destination -c api_host=claus-api.cbx.xyz stream_host=https://dpv7mez7ofol6.cloudfront.net --all
`
## Supported file-types
See `source/custom-resource/lib/s3/index.js`

## Custom origin bucket
Resource buckets very likely a plovpenninge bucket

## Custom destination bucket

Bucket-permissions -> Bucket-policy:
```
{
    "Version": "2008-10-17",
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
        {
            "Sid": "1",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <IDENTITY>"
            },
            "Action": [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::<bucket-name>",
                "arn:aws:s3:::<bucket-name>/*"
            ]
        }
    ]
}
```
Bucket-permissions -> Bucket-CORS:
```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

# Video on Demand on AWS Foundation

How to implement a video-on-demand workflow on AWS leveraging AWS Lambda, AWS Elemental MediaConvert, Amazon s3 and Amazon CloudWatch. Source code for [Video on Demand on AWS Foundation](https://aws.amazon.com/solutions/video-on-demand-on-aws/) solution.

## Architecture Overview
![Architecture](architecture.png)

The AWS CloudFormation template deploys a workflow that ingests source videos, transcodes the videos into multiple Adaptive Bitrate Formats (ABR) and delivers the content through Amazon CloudFront. The solution creates a source Amazon S3 bucket to store the source video files, and a destination bucket to store the outputs from AWS Elemental MediaConvert. A  job-settings.json file, used to define the encoding settings for MediaConvert, is uploaded to the source S3 bucket.

The solution includes two AWS lambda functions: a job submit function to create the encoding jobs in MediaConvert and a job complete function to process the outputs. Amazon CloudWatch tracks encoding jobs in MediaConvert and triggers the Lambda job complete function. An Amazon SNS topic is deployed to send notifications of completed jobs, and Amazon CloudFront is configured with the destination S3 bucket as the origin for global distribution of the transcoded video content.

For more detail including using your own settings file please see the [solution implementation guide](https://docs.aws.amazon.com/solutions/latest/video-on-demand-on-aws-foundation/welcome.html)



## Creating a custom build
The solution can be deployed through the CloudFormation template available on the solution home page: [Video on Demand on AWS](https://aws.amazon.com/solutions/video-on-demand-on-aws/).

The solution was developed using the [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/latest/guide/home.html) and leverage 3 of the [AWS Solutions Constructs](https://docs.aws.amazon.com/solutions/latest/constructs/welcome.html). To make changes to the solution, download or clone this repo, update the source code and then either deploy the solution using the CDK or run the deployment/build-s3-dist.sh script. The build script will generate the CloudFormation template from the CDK source code using cdk synth, run deployment/cdk-solution-helper to update the template to pull the lambda source code from S3 and package the Lambda code ready to be deployed to an Amazon S3 bucket in your account.  

For details on deploying the solution using the CDK see the [CDK Getting Started guide](https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html)


### Prerequisites:
* [AWS Command Line Interface](https://aws.amazon.com/cli/)
* Node.js 12.x or later
* aws-cdk version 1.63.0


### 1. Running unit tests for customization
Run unit tests to make sure added customization passes the tests:
```
cd source/custom-resource
npm install
cd ../job-submit
npm install

# Then go back to deployment directory
cd ../../deployment
chmod +x ./run-unit-tests.sh
./run-unit-tests.sh
```

### 2. Create an Amazon S3 Bucket
The CloudFormation template is configured to pull the Lambda deployment packages from Amazon S3 bucket in the region the template is being launched in. Create a bucket in the desired region with the region name appended to the name of the bucket (e.g. for us-east-1 create a bucket named ```my-bucket-us-east-1```).
```
aws s3 mb s3://my-bucket-us-east-1
```

### 3. Create the deployment packages
Build the distributable:
```
chmod +x ./build-s3-dist.sh
./build-s3-dist.sh my-bucket video-on-demand-on-aws-foundation v1.0.0
```

> **Notes**: The _build-s3-dist_ script expects the bucket name as one of its parameters, and this value should not include the region suffix.

Deploy the distributable to the Amazon S3 bucket in your account:
```
aws s3 cp ./regional-s3-assets/ s3://my-bucket-us-east-1/video-on-demand-on-aws-foundation/v1.0.0/ --recursive --acl bucket-owner-full-control
```

### 4. Launch the CloudFormation template.
* Deploy the cloudFormation template from deployment/global-assets/video-on-demand-on-aws-foundation.template into the same region as you newly created S3 bucket.


***

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

This solution collects anonymous operational metrics to help AWS improve the quality of features of the solution. For more information, including how to disable this capability, please see the implementation guide.
