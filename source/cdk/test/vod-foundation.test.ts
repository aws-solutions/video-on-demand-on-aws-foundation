/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { SynthUtils } from '@aws-cdk/assert';
import { Stack } from 'aws-cdk-lib';
import * as VodStack from '../lib/vod-foundation-stack';

const regexHashedFileName = /[A-Fa-f0-9]{64}(\.[a-z]{3,4})$/;
const replaceHashedName = "[HASH REMOVED]$1";

expect.addSnapshotSerializer({
    test: (val) => typeof val === 'string' && regexHashedFileName.test(val),
    serialize: (val, config, indentation, depth, refs, printer) => {
        const replaced = val.replace(regexHashedFileName, replaceHashedName);
        return printer(replaced, config, indentation, depth, refs);
    }
});

test('VOD Foundation Stack Test', () => {
    const stack = new Stack();
    const vodTest = new VodStack.VodFoundation(stack, 'VOD');
    expect(SynthUtils.toCloudFormation(vodTest)).toMatchSnapshot();
});
