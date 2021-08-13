#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VodFoundation } from '../lib/vod-foundation-stack';
import {CbxAddition} from "../lib/cbx-additions-stack";

const branch = process.env.BUILD_BRANCH

if (branch == undefined || !(['main', 'development'].includes(branch))) {
    throw new Error(`"${branch}" is not a valid deployment target. Did you forget to set env var BUILD_BRANCH?`)
}
console.log(`building for "${branch}"`)

const app = new cdk.App();

const DESTINATION_BUCKET_NAME: string = app.node.tryGetContext('destination_bucket_name');
const API_HOST: string = app.node.tryGetContext('api_host');
const STREAM_HOST: string = app.node.tryGetContext('stream_host');

console.log(DESTINATION_BUCKET_NAME, API_HOST, STREAM_HOST)

throw new Error("LOL")

const base = new VodFoundation(DESTINATION_BUCKET_NAME, app, `streaming-defaults-${branch}`);

new CbxAddition(STREAM_HOST, API_HOST, base.getMediaConvertEndpoint(), base.getSnsTopic(), branch, app, `streaming-custom-${branch}`)
