#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {VodFoundation} from '../lib/vod-foundation-stack';
import {CbxAddition} from "../lib/cbx-additions-stack";
import {StreamingImmutable} from "../lib/immutable";

const branch = process.env.BUILD_BRANCH

if (branch == undefined || !(['main', 'development'].includes(branch))) {
    throw new Error(`"${branch}" is not a valid deployment target. Did you forget to set env var BUILD_BRANCH?`)
}
console.log(`building for "${branch}"`)

const app = new cdk.App();

const DESTINATION_BUCKET_NAME: string = app.node.tryGetContext(branch).destination_bucket_name;
const API_HOST: string = app.node.tryGetContext(branch).api_host;
const STREAM_HOST: string = app.node.tryGetContext(branch).stream_host;
const SRC_BUCKET_NAME: string = app.node.tryGetContext(branch).src_bucket_name

const immutable = new StreamingImmutable(branch, app, `streaming-immutable-${branch}`)

const base = new VodFoundation(
    DESTINATION_BUCKET_NAME,
    app,
    `streaming-mutable-defaults-${branch}`
);

new CbxAddition(
    immutable.getApiKey(),
    DESTINATION_BUCKET_NAME,
    SRC_BUCKET_NAME,
    base.getSourceBucket(),
    STREAM_HOST,
    API_HOST,
    base.getMediaConvertEndpoint(),
    base.getSnsTopic(),
    branch,
    app,
    `streaming-mutable-custom-${branch}`
)
