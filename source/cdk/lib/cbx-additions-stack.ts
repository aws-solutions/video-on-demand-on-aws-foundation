import * as cdk from "@aws-cdk/core";
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam'
import {RetentionDays} from "@aws-cdk/aws-logs";
import * as mediaconvert from '@aws-cdk/aws-mediaconvert';
import * as subs from '@aws-cdk/aws-sns'
import {ApiKey, Deployment, LambdaIntegration, RestApi, SecurityPolicy} from "@aws-cdk/aws-apigateway"
import * as ssm from '@aws-cdk/aws-ssm';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import {LambdaToSns} from "@aws-solutions-constructs/aws-lambda-sns";
import {LayerVersion} from "@aws-cdk/aws-lambda";

export class CbxAddition extends cdk.Stack {
    constructor(streamHost: string, apiHost: string, mediaConvertEndpoint: string, encodingComplete: LambdaToSns, branch: string, scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const subtitleConversionLambda = new lambda.Function(this, `subtitle-conversion-${branch}`, {
            runtime: lambda.Runtime.PYTHON_3_8,
            code: lambda.Code.fromAsset('../subtitles/conversion'),
            handler: 'lambda_function.lambda_handler',
            logRetention: RetentionDays.ONE_MONTH
        })

        const docsAccessRole = iam.Role.fromRoleArn(this, `docs-access-role-${branch}`, 'arn:aws:iam::233403125868:role/Lambda_S3_SQS_Role', {
            mutable: false,
        });

        const dependency_layer = new LayerVersion(this, `dependency_layer-${branch}`, {
            code: lambda.Code.fromAsset('../video-ready/layer/layer.zip'),
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
            description: "Layer with dependencies for project python lambdas",
        })

        const videoReadyLambda = new lambda.Function(this, `video-ready-${branch}`, {
            runtime: lambda.Runtime.PYTHON_3_8,
            code: lambda.Code.fromAsset('../video-ready'),
            handler: 'lambda_function.lambda_handler',
            layers: [dependency_layer],
            environment: {
                'HOST': apiHost,
                'MEDIA_CONVERT_ENDPOINT': mediaConvertEndpoint,
                'PATH_SUCCESS': "",
                'PATH_FAILURE': "",
                'STREAM_HOST': streamHost,
            },
            logRetention: RetentionDays.ONE_MONTH
        })

        const eventSource = new lambdaEventSources.SnsEventSource(encodingComplete.snsTopic);
        videoReadyLambda.addEventSource(eventSource);

        videoReadyLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["mediaconvert:GetJob"],
            resources: [`arn:${cdk.Aws.PARTITION}:mediaconvert:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:*`]
        }))

        //TODO: SSM param store access!
        const subtitlePublicDocsLambda = new lambda.Function(this, `subtitle-docs-${branch}`, {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset('../subtitles/docs'),
            handler: 'lambda_function.lambda_handler',
            role: docsAccessRole,
            logRetention: RetentionDays.ONE_MONTH
        })

        const subtitlePrivateDocsLambda = new lambda.Function(this, `subtitle-private-docs-${branch}`, {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset('../subtitles/private-docs'),
            handler: 'lambda_function.lambda_handler',
            role: docsAccessRole,
            logRetention: RetentionDays.ONE_MONTH
        })


        const subtitleConversionApi = new RestApi(this, `cdn_api-${branch}`, {
            restApiName: `cdn-${branch}`,
        })

        subtitleConversionApi.root
            .addMethod('GET', new LambdaIntegration(subtitlePublicDocsLambda, {proxy: true}))

        subtitleConversionApi.root
            .addMethod('POST', new LambdaIntegration(subtitleConversionLambda, {proxy: true}))

        subtitleConversionApi.root
            .addResource('3ea062c1-72cc-4f29-b4a8-b66d8276eb64')
            .addMethod('GET', new LambdaIntegration(subtitlePrivateDocsLambda, {proxy: true}))

        subtitleConversionApi.root
            .addResource('public-docs')
            .addMethod('GET', new LambdaIntegration(subtitlePublicDocsLambda, {proxy: true}))
    }
}
