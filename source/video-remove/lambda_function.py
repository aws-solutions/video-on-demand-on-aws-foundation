import json
import logging
import os
import urllib
import urllib.parse

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def remove_dynamo_entry(guid: str):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ.get('VIDEO_STREAMING_DYNAMO_TABLE'))
    table.delete_item(Key={'guid': guid})
    logger.info(f"Removed entry by guid: '{guid}' from dynamo table: '{table}'")


def remove_video_source(src_file_name: str):
    s3_client = boto3.client('s3')
    bucket_name = os.environ.get('S3_SOURCE_FILE_BUCKET_NAME')
    prefix_matches = s3_client.list_objects_v2(
        Bucket=bucket_name,
        Prefix=src_file_name,
    ).get('Contents', [])
    match_count = len(prefix_matches)
    if match_count == 0:
        logger.warning(f"0 objects matching prefix: '{src_file_name}' in bucket: '{bucket_name}'")
        return
    if match_count > 1:
        raise Exception(f"More than 1 ({match_count}) objects matching prefix: '{src_file_name}' in bucket: '{bucket_name}'")
    remove_from_s3(bucket_name, [prefix_matches[0]['Key']])


def remove_video_destination(guid: str):
    s3_client = boto3.client('s3')
    bucket_name = os.environ.get('S3_VIDEO_STREAMING_DESTINATION_BUCKET_NAME')
    prefix_matches = s3_client.list_objects_v2(
        Bucket=bucket_name,
        Prefix=guid,
    ).get('Contents', [])
    if len(prefix_matches) == 0:
        logger.warning(f"0 objects matching prefix: '{guid}' in bucket: '{bucket_name}'")
        return
    remove_from_s3(bucket_name, [match['Key'] for match in prefix_matches])


def remove_from_s3(bucket_name: str, keys: list):
    if len(bucket_name) == 0:
        raise Exception("bucket-name should never be an empty string when deleting from s3")
    for key in keys:
        if len(key) == 0:
            raise Exception("key should never be an empty string when deleting from s3")

    s3 = boto3.resource('s3')
    for key in keys:
        s3.Object(bucket_name, key).delete()
    logger.info(json.dumps({
        "event": "Removed objects",
        "source_bucket": bucket_name,
        "objects": keys,
    }))


def parse_url(url: str):
    # https://video.skyfish.com/c3719e3d-40c9-42d6-bd42-a9be9ff8b52d/hls/test_251763-34863180.m3u8
    # parse url from the back as we control that part of the url
    extensionless_url = url[:-5]
    src_file_name_without_file_extension = extensionless_url[extensionless_url.rfind('/') + 1:]
    guid = url.split('/')[-3:-2][0]
    if len(guid) == 0 or len(src_file_name_without_file_extension) == 0:
        raise Exception(
            f"Empty result while parsing url: '{url}'. Source name: '{src_file_name_without_file_extension}', guid: '{guid}'")

    #TODO: Reintroduce this once we have propper separation
    #run_env = os.environ.get('ENVIRONMENT')
    #file_env = src_file_name_without_file_extension[:4]
    #if file_env != run_env:
    #    raise Exception(f"Attempt to delete {file_env} file in env {run_env}")
    return guid, src_file_name_without_file_extension


def lambda_handler(event, context):
    if event['pathParameters'] is None or 'url' not in event['pathParameters']:
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "headers": {},
            "body": "No url provided"
        }
    url = urllib.parse.unquote(event['pathParameters']['url'])
    guid, src_file_name = parse_url(url)

    logger.info(json.dumps({
        'url': url,
        'source_file_name': src_file_name,
        'guid': guid
    }))

    remove_video_source(src_file_name)
    remove_video_destination(guid)
    remove_dynamo_entry(guid)

    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {},
        "body": json.dumps({
            'url': url,
            'source_file_name': src_file_name,
            'guid': guid
        })
    }
