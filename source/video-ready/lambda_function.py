import os
import json
import boto3


def lambda_handler(event, context):
    msg_id = event['Records'][0]['Sns']['MessageId']
    topic = event['Records'][0]['Sns']['TopicArn']
    subject = event['Records'][0]['Sns']['Subject']
    msg = json.loads(event['Records'][0]['Sns']['Message'])
    print([msg_id, topic, subject])
    print(msg)



"""
Success:
{'Records': [{'EventSource': 'aws:sns', 'EventVersion': '1.0', 'EventSubscriptionArn': 'arn:aws:sns:eu-west-1:233403125868:streaming-defaults-development-NotificationSnsTopicB941FD22-14KBBCYBEFDJ1:c4c99047-4c46-416e-95b2-d41155a45379', 'Sns': {'Type': 'Notification', 'MessageId': '5ec77153-883b-5252-b0f5-28de301c402c', 'TopicArn': 'arn:aws:sns:eu-west-1:233403125868:streaming-defaults-development-NotificationSnsTopicB941FD22-14KBBCYBEFDJ1', 'Subject': 'streaming-defaults-development: Job COMPLETE id:1628681679064-6b9jcp', 'Message': '{"Id": "1628681679064-6b9jcp","InputFile": "s3://streaming-defaults-development-source71e471f1-1ae6v0ehr77dw/assets01/pexels-tima-miroshnichenko-5453582.mp4","InputDetails": {"id": 1,"uri": "s3://streaming-defaults-development-source71e471f1-1ae6v0ehr77dw/assets01/pexels-tima-miroshnichenko-5453582.mp4","video": [{"bitDepth": 8,"codec": "H_264","colorFormat": "YUV_420","fourCC": "avc1","frameRate": 25,"height": 3840,"interlaceMode": "PROGRESSIVE","sar": "1:1","standard": "UNSPECIFIED","streamId": 1,"width": 2160}]},"Outputs": {"HLS_GROUP": ["https://dpv7mez7ofol6.cloudfront.net/1f835d24-71c0-474e-8b54-9b4820b0e900/AppleHLS1/pexels-tima-miroshnichenko-5453582.m3u8"]}}', 'Timestamp': '2021-08-11T11:35:03.695Z', 'SignatureVersion': '1', 'Signature': 'bv5z8Wp6ik95/QMuh6e2lOkqB9qMnL6vCkjyH3JN3D/SmW2sitnUhp0J47OX/doVx9a5nEdxwFsFuuiBZDjARs+f4HY3YjcxIvN1QS5nc4kCav5A9HOD82yt56BmfbUmQYswfTDWIVLorROn0lxA1l4tTcs5F5fp2rdgtyFu6WDvRc7e8O6FbBIvlX9QECQnpa6bY+IKVz6s87SsTENOOagM1p/jKGi7RXIqeOWZfK4MsjiZvNVSQEOfqcDfBfuNZy+hNdQ/k2ex+HNRWgNx1QjnMk6dNy71XXxqzNVYOtLn+Fkm3f3w1jz1rsqX+qz0XZg5G+hQiFA69V0RkBckzA==', 'SigningCertUrl': 'https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-010a507c1833636cd94bdb98bd93083a.pem', 'UnsubscribeUrl': 'https://sns.eu-west-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-1:233403125868:streaming-defaults-development-NotificationSnsTopicB941FD22-14KBBCYBEFDJ1:c4c99047-4c46-416e-95b2-d41155a45379', 'MessageAttributes': {}}}]}
Msg:
{'Id': '1628683108041-ifdvhu', 'InputFile': 's3://streaming-defaults-development-source71e471f1-1ae6v0ehr77dw/assets01/pexels-tima-miroshnichenko-5453582.mp4', 'InputDetails': {'id': 1, 'uri': 's3://streaming-defaults-development-source71e471f1-1ae6v0ehr77dw/assets01/pexels-tima-miroshnichenko-5453582.mp4', 'video': [{'bitDepth': 8, 'codec': 'H_264', 'colorFormat': 'YUV_420', 'fourCC': 'avc1', 'frameRate': 25, 'height': 3840, 'interlaceMode': 'PROGRESSIVE', 'sar': '1:1', 'standard': 'UNSPECIFIED', 'streamId': 1, 'width': 2160}]}, 'Outputs': {'HLS_GROUP': ['https://dpv7mez7ofol6.cloudfront.net/20f9922f-44a5-4b62-85c2-a49f9e0e55ec/AppleHLS1/pexels-tima-miroshnichenko-5453582.m3u8']}}

Failure:
{'Details': 'https://console.aws.amazon.com/mediaconvert/home?region=eu-west-1#/jobs/summary/1628686542877-ihbwjg', 'ErrorMsg': {'version': '0', 'id': '3dc9e737-910c-8aea-6362-b97ca52a299f', 'detail-type': 'MediaConvert Job State Change', 'source': 'aws.mediaconvert', 'account': '233403125868', 'time': '2021-08-11T12:55:47Z', 'region': 'eu-west-1', 'resources': ['arn:aws:mediaconvert:eu-west-1:233403125868:jobs/1628686542877-ihbwjg'], 'detail': {'timestamp': 1628686547018, 'accountId': '233403125868', 'queue': 'arn:aws:mediaconvert:eu-west-1:233403125868:queues/Default', 'jobId': '1628686542877-ihbwjg', 'status': 'ERROR', 'errorCode': 1030, 'errorMessage': 'Video codec [png] is not a supported input video codec', 'userMetadata': {'Guid': '08ac9fb0-2ee7-46c2-a44b-61d3c85d9f47', 'StackName': 'streaming-defaults-development', 'SolutionId': 'SO0146'}}}}
"""