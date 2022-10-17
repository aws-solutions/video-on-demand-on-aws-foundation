import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import { HttpMethods } from '@aws-cdk/aws-s3';
import * as appreg from '@aws-cdk/aws-servicecatalogappregistry';
import * as applicationinsights from '@aws-cdk/aws-applicationinsights';
/**
 * AWS Solution Constructs: https://docs.aws.amazon.com/solutions/latest/constructs/
 */
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { EventsRuleToLambda } from '@aws-solutions-constructs/aws-events-rule-lambda';
import { LambdaToSns } from '@aws-solutions-constructs/aws-lambda-sns';


export class VodFoundation extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        /**
         * CloudFormation Template Descrption
         */
        const solutionId = 'SO0146'
        const solutionName = 'Video on Demand on AWS Foundation'
        this.templateOptions.description = '(SO0146) v1.2.0: Video on Demand on AWS Foundation Solution Implementation';
        /**
         * Mapping for sending anonymous metrics to AWS Solution Builders API
         */
        new cdk.CfnMapping(this, 'Send', { // NOSONAR
            mapping: {
                AnonymousUsage: {
                    Data: 'Yes'
                }
            }
        });
        /**
         * Cfn Parameters
         */
        const adminEmail = new cdk.CfnParameter(this, "emailAddress", {
            type: "String",
            description: "The admin email address to receive SNS notifications for job status.",
            allowedPattern: "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
        });
        /**
         * Logs bucket for S3 and CloudFront
        */
        const logsBucket = new s3.Bucket(this, 'Logs', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });
        /**
         * Get Cfn Resource for the logs bucket and add CFN_NAG rule
         */
        const cfnLogsBucket = logsBucket.node.findChild('Resource') as s3.CfnBucket;
        cfnLogsBucket.cfnOptions.metadata = {
            cfn_nag: {
                rules_to_suppress: [{
                    id: 'W35',
                    reason: 'Logs bucket does not require logging configuration'
                }, {
                    id: 'W51',
                    reason: 'Logs bucket is private and does not require a bucket policy'
                }]
            }
        };
        /**
         * Source S3 bucket to host source videos and jobSettings JSON files
        */
        const source = new s3.Bucket(this, 'Source', {
            serverAccessLogsBucket: logsBucket,
            serverAccessLogsPrefix: 'source-bucket-logs/',
            encryption: s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });
        const cfnSource = source.node.findChild('Resource') as s3.CfnBucket;
        cfnSource.cfnOptions.metadata = {
            cfn_nag: {
                rules_to_suppress: [{
                    id: 'W51',
                    reason: 'source bucket is private and does not require a bucket policy'
                }]
            }
        };
        /**
         * Destination S3 bucket to host the mediaconvert outputs
        */
        const destination = new s3.Bucket(this, 'Destination', {
            serverAccessLogsBucket: logsBucket,
            serverAccessLogsPrefix: 'destination-bucket-logs/',
            encryption: s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            cors: [
                {
                  maxAge: 3000,
                  allowedOrigins: ['*'],
                  allowedHeaders: ['*'],
                  allowedMethods: [HttpMethods.GET]
                },
              ],
        });
        /**
         * Solutions construct to create Cloudfrotnt with an s3 bucket as the origin
         * https://docs.aws.amazon.com/solutions/latest/constructs/aws-cloudfront-s3.html
         * insertHttpSecurityHeaders is set to false as this requires the deployment to be in us-east-1
        */
        const cloudFront = new CloudFrontToS3(this, 'CloudFront', {
            existingBucketObj: destination,
            insertHttpSecurityHeaders: false,
            cloudFrontDistributionProps: {
                comment:`${cdk.Aws.STACK_NAME} Video on Demand Foundation`,
                defaultCacheBehavior: {
                    allowedMethods: [ 'GET', 'HEAD','OPTIONS' ],
                    Compress: false,
                    forwardedValues: {
                      queryString: false,
                      headers: [ 'Origin', 'Access-Control-Request-Method','Access-Control-Request-Headers' ],
                      cookies: { forward: 'none' }
                    },
                    viewerProtocolPolicy: 'allow-all'
                },
                loggingConfig: {
                    bucket: logsBucket,
                    prefix: 'cloudfront-logs'
                }
            }
        });
        /**
         * MediaConvert Service Role to grant Mediaconvert Access to the source and Destination Bucket,
         * API invoke * is also required for the services.
        */
        const mediaconvertRole = new iam.Role(this, 'MediaConvertRole', {
            assumedBy: new iam.ServicePrincipal('mediaconvert.amazonaws.com'),
        });
        const mediaconvertPolicy = new iam.Policy(this, 'MediaconvertPolicy', {
            statements: [
                new iam.PolicyStatement({
                    resources: [`${source.bucketArn}/*`, `${destination.bucketArn}/*`],
                    actions: ['s3:GetObject', 's3:PutObject']
                }),
                new iam.PolicyStatement({
                    resources: [`arn:${cdk.Aws.PARTITION}:execute-api:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:*`],
                    actions: ['execute-api:Invoke']
                })
            ]
        });
        mediaconvertPolicy.attachToRole(mediaconvertRole);
        /**
         * Custom Resource, Role and Policy.
         */
        const customResourceLambda = new lambda.Function(this, 'CustomResource', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            description: 'CFN Custom resource to copy assets to S3 and get the MediaConvert endpoint',
            code: lambda.Code.fromAsset('../custom-resource'),
            timeout: cdk.Duration.seconds(30),
			initialPolicy: [
				new iam.PolicyStatement({
					actions: ["s3:PutObject","s3:PutBucketNotification"],
					resources: [source.bucketArn, `${source.bucketArn}/*`]
				}),
				new iam.PolicyStatement({
					actions: ["mediaconvert:DescribeEndpoints"],
					resources: [`arn:aws:mediaconvert:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:*`],
				})
			]
        });
        /** get the cfn resource for the role and attach cfn_nag rule */
        const cfnCustomResource = customResourceLambda.node.findChild('Resource') as lambda.CfnFunction;
        cfnCustomResource.cfnOptions.metadata = {
            cfn_nag: {
                rules_to_suppress: [{
                    id: 'W58',
                    reason: 'Invalid warning: function has access to cloudwatch'
                },
                {
                    id: 'W89',
                    reason: 'Invalid warning: lambda not needed in VPC'
                },
                {
                    id: 'W92',
                    reason: 'Invalid warning: lambda does not need ReservedConcurrentExecutions'
                }]
            }
        };
        /**
         * Call the custom resource, this will return the MediaConvert endpoint and a UUID
        */
        const customResourceEndpoint = new cdk.CustomResource(this, 'Endpoint', {
            serviceToken: customResourceLambda.functionArn
        });

        /**
         * Job submit Lambda function, triggered by S3 Put events in the source S3 bucket
        */
        const jobSubmit = new lambda.Function(this, 'jobSubmit', {
            code: lambda.Code.fromAsset(`../job-submit`),
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            timeout: cdk.Duration.seconds(30),
            retryAttempts:0,
            description: 'Submits an Encoding job to MediaConvert',
            environment: {
                MEDIACONVERT_ENDPOINT: customResourceEndpoint.getAttString('Endpoint'),
                MEDIACONVERT_ROLE: mediaconvertRole.roleArn,
                JOB_SETTINGS: 'job-settings.json',
                DESTINATION_BUCKET: destination.bucketName,
                SOLUTION_ID: 'SO0146',
                STACKNAME: cdk.Aws.STACK_NAME,
                /** SNS_TOPIC_ARN: added by the solution construct below */
            },
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ["iam:PassRole"],
                    resources: [mediaconvertRole.roleArn]
                }),
                new iam.PolicyStatement({
                    actions: ["mediaconvert:CreateJob"],
                    resources: [`arn:${cdk.Aws.PARTITION}:mediaconvert:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:*`]
                }),
                new iam.PolicyStatement({
                    actions: ["s3:GetObject"],
                    resources: [source.bucketArn, `${source.bucketArn}/*`]
                })
			]
        });
        /** Give S3 permission to trigger the job submit lambda function  */
        jobSubmit.addPermission('S3Trigger', {
            principal: new iam.ServicePrincipal('s3.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceAccount: cdk.Aws.ACCOUNT_ID
        });
        /** get the cfn resource for the role and attach cfn_nag rule */
        const cfnJobSubmit = jobSubmit.node.findChild('Resource') as lambda.CfnFunction;
        cfnJobSubmit.cfnOptions.metadata = {
            cfn_nag: {
                rules_to_suppress: [{
                    id: 'W58',
                    reason: 'Invalid warning: function has access to cloudwatch'
                },
                {
                    id: 'W89',
                    reason: 'Invalid warning: lambda not needed in VPC'
                },
                {
                    id: 'W92',
                    reason: 'Invalid warning: lambda does not need ReservedConcurrentExecutions'
                }]
            }
        };
        /**
         * Process outputs lambda function, invoked by CloudWatch events for MediaConvert.
         * Parses the CW event outputs, creates the CloudFront URLs for the outputs, updates
         * a manifest file in the destination bucket and send an SNS notfication.
         * Enviroment variables for the destination bucket and SNS topic are added by the
         *  solutions constructs
         */
        const jobComplete = new lambda.Function(this, 'JobComplete', {
            code: lambda.Code.fromAsset(`../job-complete`),
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            timeout: cdk.Duration.seconds(30),
            retryAttempts:0,
            description: 'Triggered by Cloudwatch Events,processes completed MediaConvert jobs.',
            environment: {
                MEDIACONVERT_ENDPOINT: customResourceEndpoint.getAttString('Endpoint'),
                CLOUDFRONT_DOMAIN: cloudFront.cloudFrontWebDistribution.distributionDomainName,
                /** SNS_TOPIC_ARN: added by the solution construct below */
                SOURCE_BUCKET: source.bucketName,
                JOB_MANIFEST: 'jobs-manifest.json',
                STACKNAME: cdk.Aws.STACK_NAME,
                METRICS:  cdk.Fn.findInMap('Send', 'AnonymousUsage', 'Data'),
                SOLUTION_ID:'SO0146',
                VERSION:'1.0.0',
                UUID:customResourceEndpoint.getAttString('UUID')
            },
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ["mediaconvert:GetJob"],
                    resources: [`arn:${cdk.Aws.PARTITION}:mediaconvert:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:*`]
                }),
                new iam.PolicyStatement({
                    actions: ["s3:GetObject", "s3:PutObject"],
                    resources: [`${source.bucketArn}/*`]
                })
            ]
        });
        const cfnJobComplete = jobComplete.node.findChild('Resource') as lambda.CfnFunction;
        cfnJobComplete.cfnOptions.metadata = {
            cfn_nag: {
                rules_to_suppress: [{
                    id: 'W58',
                    reason: 'Invalid warning: function has access to cloudwatch'
                },
                {
                    id: 'W89',
                    reason: 'Invalid warning: lambda not needed in VPC'
                },
                {
                    id: 'W92',
                    reason: 'Invalid warning: lambda does not need ReservedConcurrentExecutions'
                }]
            }
        };
        /**
         * Custom resource to configure the source S3 bucket; upload default job-settings file and 
         * enabble event notifications to trigger the job-submit lambda function
         */
        new cdk.CustomResource(this, 'S3Config', { // NOSONAR
            serviceToken: customResourceLambda.functionArn,
            properties: {
                SourceBucket: source.bucketName,
                LambdaArn: jobSubmit.functionArn
            }
        });
        /**
         * Solution constructs, creates a CloudWatch event rule to trigger the process
         * outputs lambda functions.
         */
        new EventsRuleToLambda(this, 'EventTrigger', { // NOSONAR
            existingLambdaObj: jobComplete,
            eventRuleProps: {
                enabled: true,
                eventPattern: {
                    "source": ["aws.mediaconvert"],
                    "detail": {
                        "userMetadata": {
                            "StackName": [
                                cdk.Aws.STACK_NAME
                            ]
                        },
                        "status": [
                            "COMPLETE",
                            "ERROR",
                            "CANCELED",
                            "INPUT_INFORMATION"
                        ]
                    }
                }
            }
        });
        /**
         * Solutions construct, creates an SNS topic and a Lambda function  with permission
         * to publish messages to the topic. Also adds the SNS topic to the lambda Enviroment
         * varribles
        */
        const snsTopic = new LambdaToSns(this, 'Notification', {
            existingLambdaObj: jobSubmit
        });
        new LambdaToSns(this, 'CompleteSNS', { // NOSONAR
            existingLambdaObj: jobComplete,
            existingTopicObj: snsTopic.snsTopic
        });
        /**
         * Subscribe the admin email address to the SNS topic created but the construct.
         */
        snsTopic.snsTopic.addSubscription(new subs.EmailSubscription(adminEmail.valueAsString))

        /**
        * AppRegistry
        */
        const applicationName = `vod-foundation-${cdk.Aws.STACK_NAME}`;
        const attributeGroup = new appreg.AttributeGroup(this, 'AppRegistryAttributeGroup', {
            attributeGroupName: cdk.Aws.STACK_NAME,
            description: "Attribute group for solution information.",
            attributes: {
                ApplicationType: 'AWS-Solutions',
                SolutionVersion: '%%VERSION%%',
                SolutionID: solutionId,
                SolutionName: solutionName
            }
        });
        const appRegistry = new appreg.Application(this, 'AppRegistryApp', {
            applicationName: applicationName,
            description: `Service Catalog application to track and manage all your resources. The SolutionId is ${solutionId} and SolutionVersion is %%VERSION%%.`
        });
        appRegistry.associateStack(this);
        cdk.Tags.of(appRegistry).add('solutionId', solutionId);
        cdk.Tags.of(appRegistry).add('SolutionName', solutionName);
        cdk.Tags.of(appRegistry).add('SolutionDomain', 'CloudFoundations');
        cdk.Tags.of(appRegistry).add('SolutionVersion', '%%VERSION%%');
        cdk.Tags.of(appRegistry).add('appRegistryApplicationName', 'vod-foundation-stack');
        cdk.Tags.of(appRegistry).add('ApplicationType', 'AWS-Solutions');

        appRegistry.node.addDependency(attributeGroup);
        appRegistry.associateAttributeGroup(attributeGroup);

        const appInsights = new applicationinsights.CfnApplication(this, 'ApplicationInsightsApp', {
            resourceGroupName: `AWS_AppRegistry_Application-${applicationName}`,
            autoConfigurationEnabled: true,
            cweMonitorEnabled: true,
            opsCenterEnabled: true
        });
        appInsights.node.addDependency(appRegistry);
        
        /**
         * Stack Outputs
        */
        new cdk.CfnOutput(this, 'SourceBucket', { // NOSONAR
            value: source.bucketName,
            description: 'Source S3 Bucket used to host source video and MediaConvert job settings files',
            exportName: `${ cdk.Aws.STACK_NAME}-SourceBucket`
        });
        new cdk.CfnOutput(this, 'DestinationBucket', { // NOSONAR
            value: destination.bucketName,
            description: 'Source S3 Bucket used to host all MediaConvert ouputs',
            exportName: `${ cdk.Aws.STACK_NAME}-DestinationBucket`
        });
        new cdk.CfnOutput(this, 'CloudFrontDomain', { // NOSONAR
            value: cloudFront.cloudFrontWebDistribution.distributionDomainName,
            description: 'CloudFront Domain Name',
            exportName: `${ cdk.Aws.STACK_NAME}-CloudFrontDomain`
        });
        new cdk.CfnOutput(this, 'SnsTopic', { // NOSONAR
            value: snsTopic.snsTopic.topicName,
            description: 'SNS Topic used to capture the VOD workflow outputs including errors',
            exportName: `${ cdk.Aws.STACK_NAME}-SnsTopic`
        });
    }
}
