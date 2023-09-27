import { SynthUtils } from '@aws-cdk/assert';
import { Stack } from 'aws-cdk-lib';
import * as VodStack from '../lib/vod-foundation-stack';

expect.addSnapshotSerializer({
    test: (val) => typeof val === 'string',
    print: (val) => {
        const valueReplacements = [
            {
                regex: /([A-Fa-f0-9]{64}).zip/,
                replacementValue: '[HASH REMOVED].zip'
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
    const vodTest = new VodStack.VodFoundation(stack, 'VOD');
    expect(SynthUtils.toCloudFormation(vodTest)).toMatchSnapshot();
});