import { SynthUtils } from '@aws-cdk/assert';
import { Stack } from 'aws-cdk-lib';
import * as VodStack from '../lib/vod-foundation-stack';

expect.addSnapshotSerializer({
    test: (val) => typeof val === 'string',
    print: (val) => {
        const valueReplacements = [
            {
                regex: /AssetParameters([A-Fa-f0-9]{64})(\w+)/,
                replacementValue: 'AssetParameters[HASH REMOVED]'
            },
            {
                regex: /(\w+ for asset)\s?(version)?\s?"([A-Fa-f0-9]{64})"/,
                replacementValue: '$1 [HASH REMOVED]'
            }
        ];
        return `${valueReplacements.reduce(
            (output, replacement) => output.replace(replacement.regex, replacement.replacementValue),
            val as string
        )}`;
    }
});

test('VOD Foundation Stack Test', () => {
    const stack = new Stack();
    new VodStack.VodFoundation(stack, 'VOD');
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});