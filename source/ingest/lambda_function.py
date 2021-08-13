import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

SRC_BUCKET_NAME = os.environ['SRC_BUCKET_NAME']
DEST_BUCKET_NAME = os.environ.get('DEST_BUCKET_NAME')


def _s3_copy(copy_source, dest_bucket_name, dest_object_name):
    boto3.resource('s3').meta.client.copy(copy_source, dest_bucket_name, dest_object_name)


def copy_object(src_bucket_name, src_object_name,
                dest_bucket_name, dest_object_name=None):
    # Construct source bucket/object parameter
    copy_source = {'Bucket': src_bucket_name, 'Key': src_object_name}
    if dest_object_name is None:
        dest_object_name = src_object_name

    # Copy the object
    logger.info(f"Calling _s3_copy({copy_source}, {dest_bucket_name}, {dest_object_name})")
    _s3_copy(copy_source, dest_bucket_name, dest_object_name)
    logger.info(f"Successfully copied: {src_object_name} to: {dest_object_name}")


def lambda_handler(message, context):
    logger.info(message)
    receipt_handle = message['Records'][0]['receiptHandle']
    media_identifier = message['Records'][0]['messageAttributes']['media_identifier']['stringValue']
    src_object_name = str(message['Records'][0]['body'])
    logger.info(f"{receipt_handle}|{SRC_BUCKET_NAME}|{media_identifier}|{src_object_name}")
    file_extension = src_object_name.split(".")[-1]
    dest_object_name = f"assets01/{media_identifier}.{file_extension.lower()}"
    copy_object(SRC_BUCKET_NAME, src_object_name, DEST_BUCKET_NAME, dest_object_name)
