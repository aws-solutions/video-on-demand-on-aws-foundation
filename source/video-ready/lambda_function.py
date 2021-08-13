import json
import os

import boto3
import requests

import libraries.api as colourbox

API_HOST = os.environ['HOST']
MEDIA_CONVERT_ENDPOINT = os.environ['MEDIA_CONVERT_ENDPOINT']
PATH_SUCCESS = os.environ['PATH_SUCCESS']
PATH_FAILURE = os.environ['PATH_FAILURE']


def get_dns_uri(cloudfront_uri):
    return cloudfront_uri


def get_media_identifier(uri):
    return uri.split(sep="/")[-1]


def get_file_source_name_from_job_id(job_id):
    client = boto3.client('mediaconvert', endpoint_url=MEDIA_CONVERT_ENDPOINT)
    document = client.get_job(
        Id=job_id
    )
    return get_media_identifier(document['Job']['Settings']['Inputs'][0]['FileInput'])


def on_success(event):
    msg = json.loads(event['Records'][0]['Sns']['Message'])
    send_success(
        get_dns_uri(msg['Outputs']['HLS_GROUP'][0]),
        get_media_identifier(msg['InputDetails']['uri']),
    )


def send_success(stream_url, file_identifier):
    print(["SUCCESS: ", stream_url, file_identifier])
    requests.post(
        url=f"{API_HOST}/{PATH_SUCCESS}",
        json={
            'stream_url': stream_url,
            'file_identifier': file_identifier,
        },
        headers=colourbox.API.with_auth_header({})
    )


def on_failure(event):
    msg = json.loads(event['Records'][0]['Sns']['Message'])
    send_failure(
        get_file_source_name_from_job_id(msg['ErrorMsg']['detail']['jobId']),
        msg['ErrorMsg']['detail']['errorMessage'],
        msg['ErrorMsg']['detail']['errorCode'],
    )


def send_failure(file_identifier, error_code, error_msg):
    print(["FAILED: ", file_identifier, error_code, error_msg])
    requests.post(
        url=f"{API_HOST}/{PATH_FAILURE}",
        json={
            'file_identifier': file_identifier,
            'error_code': error_code,
            'error_msg': error_msg,
        },
        headers=colourbox.API.with_auth_header({})
    )


def event_failed(event):
    return 'ErrorMsg' in json.loads(event['Records'][0]['Sns']['Message'])


def lambda_handler(event, context):
    if event_failed(event):
        on_failure(event)
    else:
        on_success(event)
