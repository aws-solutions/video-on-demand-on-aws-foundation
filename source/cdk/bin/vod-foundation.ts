#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VodFoundation } from '../lib/vod-foundation-stack';

const app = new cdk.App();
new VodFoundation(app, 'VodFoundation'); // NOSONAR
