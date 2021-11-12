import * as cdk from '@aws-cdk/core';
import {Duration, RemovalPolicy} from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import {IBucket} from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
/**
 * AWS Solution Constructs: https://docs.aws.amazon.com/solutions/latest/constructs/
 */
import * as Cloudfront from '@aws-cdk/aws-cloudfront';
import {ViewerProtocolPolicy} from '@aws-cdk/aws-cloudfront';
import {EventsRuleToLambda} from '@aws-solutions-constructs/aws-events-rule-lambda';
import {LambdaToSns} from '@aws-solutions-constructs/aws-lambda-sns';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import {WhiteList} from "./white-list";


export class VodFoundation extends cdk.Stack {

    private readonly snsTopic: LambdaToSns
    private readonly mediaConvertEndpoint: string
    private readonly sourceBucket: IBucket
    private readonly destinationBucket: IBucket

    public getSnsTopic(): LambdaToSns
    {
        return this.snsTopic
    }

    public getMediaConvertEndpoint(): string
    {
        return this.mediaConvertEndpoint
    }

    public getSourceBucket(): IBucket
    {
        return this.sourceBucket
    }

    public getDestinationBucket(): IBucket
    {
        return this.destinationBucket
    }

    constructor(destinationBucketName: string, scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        /**
         * CloudFormation Template Descrption
         */
        this.templateOptions.description = '(SO0146) v1.1.0: Video on Demand on AWS Foundation Solution Implementation';
        /**
         * Mapping for sending anonymous metrics to AWS Solution Builders API
         */
        new cdk.CfnMapping(this, 'Send', {
            mapping: {
                AnonymousUsage: {
                    Data: 'No'
                }
            }
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
            removalPolicy: RemovalPolicy.DESTROY,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            lifecycleRules: [{
                enabled: true,
                prefix: "assets01/stream-",
                expiration: Duration.days(30)
            }]
        });
        this.sourceBucket = source

        const cfnSource = source.node.findChild('Resource') as s3.CfnBucket;
        cfnSource.cfnOptions.metadata = {
            cfn_nag: {
                rules_to_suppress: [{
                    id: 'W51',
                    reason: 'source bucket is private and does not require a bucket policy'
                }]
            }
        };

        const destination = s3.Bucket.fromBucketName(this, "destination", destinationBucketName)


        const op = new Cloudfront.OriginRequestPolicy(this, "originRequestPolicy", {
            queryStringBehavior: Cloudfront.OriginRequestQueryStringBehavior.none(),
            cookieBehavior: Cloudfront.OriginRequestCookieBehavior.none(),
            headerBehavior: Cloudfront.OriginRequestHeaderBehavior.allowList('Origin', 'Access-Control-Allow-Origin', 'Access-Control-Request-Method','Access-Control-Request-Headers')
        })

        const cp = new Cloudfront.CachePolicy(this, "cachePolicy", {
            queryStringBehavior: Cloudfront.OriginRequestQueryStringBehavior.none(),
            cookieBehavior: Cloudfront.OriginRequestCookieBehavior.none(),
            headerBehavior: Cloudfront.OriginRequestHeaderBehavior.allowList('Origin', 'Access-Control-Allow-Origin', 'Access-Control-Request-Method','Access-Control-Request-Headers')
        })

        const cloudFront = new Cloudfront.Distribution(this, "CloudFront", {
            defaultBehavior: {
                origin: new origins.S3Origin(destination),
                allowedMethods: Cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                compress: false,
                viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
                smoothStreaming: true,
                originRequestPolicy: {
                    originRequestPolicyId: op.originRequestPolicyId
                },
                cachePolicy: {
                    cachePolicyId: cp.cachePolicyId
                },
            },
            geoRestriction: Cloudfront.GeoRestriction.allowlist(...(new WhiteList().getCloudfront())),
            comment: `${cdk.Aws.STACK_NAME} Video on Demand Foundation`,
            logBucket: logsBucket,
            logFilePrefix: 'cloudfront-logs'
        })

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
            environment: {
                SOLUTION_IDENTIFIER: 'AwsSolution/SO0146/v1.1.0'
            },
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
                    },{
                        id: 'W89',
                        reason: 'AWS Lambda does not require VPC for this solution.'
                    },{
                        id: 'W92',
                        reason: 'ReservedConcurrentExecutions not required'
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
                SOLUTION_IDENTIFIER: 'AwsSolution/SO0146/v1.1.0'
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
                },{
                    id: 'W89',
                    reason: 'AWS Lambda does not require VPC for this solution.'
                },{
                    id: 'W92',
                    reason: 'ReservedConcurrentExecutions not required'
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
                CLOUDFRONT_DOMAIN: cloudFront.distributionDomainName,
                /** SNS_TOPIC_ARN: added by the solution construct below */
                SOURCE_BUCKET: source.bucketName,
                JOB_MANIFEST: 'jobs-manifest.json',
                STACKNAME: cdk.Aws.STACK_NAME,
                METRICS:  cdk.Fn.findInMap('Send', 'AnonymousUsage', 'Data'),
                SOLUTION_ID:'SO0146',
                VERSION:'1.1.0',
                UUID:customResourceEndpoint.getAttString('UUID'),
                SOLUTION_IDENTIFIER: 'AwsSolution/SO0146/v1.1.0'
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
                },{
                    id: 'W89',
                    reason: 'AWS Lambda does not require VPC for this solution.'
                },{
                    id: 'W92',
                    reason: 'ReservedConcurrentExecutions not required'
            }]
            }
        };
        /**
         * Custom resource to configure the source S3 bucket; upload default job-settings file and
         * enabble event notifications to trigger the job-submit lambda function
         */
        new cdk.CustomResource(this, 'S3Config', {
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
        new EventsRuleToLambda(this, 'EventTrigger', {
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
        new LambdaToSns(this, 'CompleteSNS', {
            existingLambdaObj: jobComplete,
            existingTopicObj: snsTopic.snsTopic
        });
        /**
         * Stack Outputs
        */
        new cdk.CfnOutput(this, 'SourceBucket', {
            value: source.bucketName,
            description: 'Source S3 Bucket used to host source video and MediaConvert job settings files',
            exportName: `${ cdk.Aws.STACK_NAME}-SourceBucket`
        });
        new cdk.CfnOutput(this, 'DestinationBucket', {
            value: destination.bucketName,
            description: 'Source S3 Bucket used to host all MediaConvert ouputs',
            exportName: `${ cdk.Aws.STACK_NAME}-DestinationBucket`
        });
        new cdk.CfnOutput(this, 'CloudFrontDomain', {
            value: cloudFront.distributionDomainName,
            description: 'CloudFront Domain Name',
            exportName: `${ cdk.Aws.STACK_NAME}-CloudFrontDomain`
        });
        new cdk.CfnOutput(this, 'SnsTopic', {
            value: snsTopic.snsTopic.topicName,
            description: 'SNS Topic used to capture the VOD workflow outputs including errors',
            exportName: `${ cdk.Aws.STACK_NAME}-SnsTopic`
        });

        this.snsTopic = snsTopic
        this.mediaConvertEndpoint = customResourceEndpoint.getAttString('Endpoint')
        this.destinationBucket = destination
    }
}
