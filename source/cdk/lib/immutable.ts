import * as cdk from '@aws-cdk/core'
import {ApiKey} from "@aws-cdk/aws-apigateway"
import * as secretsmanager from "@aws-cdk/aws-secretsmanager"

export class StreamingImmutable extends cdk.Stack {

    apiKey: ApiKey

    constructor(branch: string, scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.apiKey = new ApiKey(this, `streaming_api_key_${branch}`, {
            apiKeyName: `streaming_api_key_${branch}`,
            description: `Key used for all ${branch} streaming endpoints`
        })
    }

    public getApiKey(): ApiKey
    {
        return this.apiKey
    }
}
