import json
import os
from requests_toolbelt.multipart import decoder
import webvtt

original_filename = "/tmp/original_subtitles"
new_filename = "/tmp/converted_subtitles.vtt"

testing_vtt = "sample.vtt"
testing_srt = "sample.srt"

event = {'resource': '/', 'path': '/', 'httpMethod': 'POST', 'headers': {'Content-Type': 'multipart/form-data; boundary=f22b0cc22697a6013c8db689d752bb1ec1c1925d', 'Host': 'smsdu3rsn4.execute-api.eu-west-1.amazonaws.com', 'User-Agent': 'GuzzleHttp/6.5.1 curl/7.61.1 PHP/7.2.24', 'X-Amzn-Trace-Id': 'Root=1-5e5fa662-8567df87a403c91a8cfa0f04', 'X-Forwarded-For': '54.229.55.219', 'X-Forwarded-Port': '443', 'X-Forwarded-Proto': 'https'}, 'multiValueHeaders': {'Content-Type': ['multipart/form-data; boundary=f22b0cc22697a6013c8db689d752bb1ec1c1925d'], 'Host': ['smsdu3rsn4.execute-api.eu-west-1.amazonaws.com'], 'User-Agent': ['GuzzleHttp/6.5.1 curl/7.61.1 PHP/7.2.24'], 'X-Amzn-Trace-Id': ['Root=1-5e5fa662-8567df87a403c91a8cfa0f04'], 'X-Forwarded-For': ['54.229.55.219'], 'X-Forwarded-Port': ['443'], 'X-Forwarded-Proto': ['https']}, 'queryStringParameters': None, 'multiValueQueryStringParameters': None, 'pathParameters': None, 'stageVariables': None, 'requestContext': {'resourceId': '8u7ebcnf4k', 'resourcePath': '/', 'httpMethod': 'POST', 'extendedRequestId': 'I3bvWHZxDoEFo2Q=', 'requestTime': '04/Mar/2020:13:00:18 +0000', 'path': '/QA', 'accountId': '233403125868', 'protocol': 'HTTP/1.1', 'stage': 'QA', 'domainPrefix': 'smsdu3rsn4', 'requestTimeEpoch': 1583326818183, 'requestId': '7e6210aa-91a4-400a-87fa-03c45313667f', 'identity': {'cognitoIdentityPoolId': None, 'accountId': None, 'cognitoIdentityId': None, 'caller': None, 'sourceIp': '54.229.55.219', 'principalOrgId': None, 'accessKey': None, 'cognitoAuthenticationType': None, 'cognitoAuthenticationProvider': None, 'userArn': None, 'userAgent': 'GuzzleHttp/6.5.1 curl/7.61.1 PHP/7.2.24', 'user': None}, 'domainName': 'smsdu3rsn4.execute-api.eu-west-1.amazonaws.com', 'apiId': 'smsdu3rsn4'}, 'body': '--f22b0cc22697a6013c8db689d752bb1ec1c1925d\r\nContent-Disposition: form-data; name="sample.srt"; filename="phpflraa1"\r\nContent-Length: 195\r\n\r\n1\n00:00:00,000 --> 00:00:01,500\nFor www.forom.com\n\n2\n00:00:01,500 --> 00:00:02,500\n<i>Tonight\'s the night.</i>\n\n3\n00:00:03,000 --> 00:00:15,000\n<i>And it\'s going to happen\nagain and again --</i>\n\r\n--f22b0cc22697a6013c8db689d752bb1ec1c1925d--\r\n', 'isBase64Encoded': False}

def lambda_handler(event, context):
    print(event)
    content_type_header = event['headers']['Content-Type']
    body = event["body"].encode()
    response = ''
    for part in decoder.MultipartDecoder(body, content_type_header).parts:
        response += part.text + "\n"
    with open(original_filename, 'w') as file_object:
        file_object.write(response)

    try:
        swap = webvtt.from_srt(original_filename)
        swap.save(new_filename)
        with open (new_filename, "r") as myfile:
            data = myfile.read()
        print("File has been converted.")
        print("HTTP: 200")
        return {
                "statusCode": 200,
                "body": data
                }
    except:
        with open(original_filename) as x:
            lines = x.readlines()
        if lines[0] == "WEBVTT\n":
            with open(original_filename, "r") as z:
                data = z.read()
            print("File is already in the WEBVTT format.")
            print("HTTP: 200")
            return {
                    "statusCode": 200,
                    "body": data
                    }
        else:
            print("File is not in either valid SRT or VTT format.")
            data = "File is not in either valid SRT or VTT format."
            print("HTTP: 415")
            return {
                    "statusCode": 415,
                    "body": data
                    }
