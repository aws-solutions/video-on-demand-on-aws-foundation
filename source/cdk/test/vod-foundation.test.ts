import { SynthUtils } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import * as VodStack from '../lib/vod-foundation-stack';

test('VOD Foundation Stack Test', () => {
    const stack = new Stack();
    new VodStack.VodFoundation(stack, 'VOD');
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});