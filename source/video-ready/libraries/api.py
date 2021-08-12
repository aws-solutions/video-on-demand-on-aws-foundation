import hmac
import time
from hashlib import sha1

import boto3


class API:
    def __init__(self, key, secret, base_url):
        self.key = key
        self.secret = secret
        self.base_url = base_url

    @staticmethod
    def get_api_key_and_secret():
        ssm_client = boto3.client('ssm')
        key = ssm_client.get_parameter(
            Name='/config/api/root/key', WithDecryption=True)['Parameter']['Value']
        secret = ssm_client.get_parameter(
            Name='/config/api/root/secret', WithDecryption=True)['Parameter']['Value']
        return key, secret

    @staticmethod
    def get_authorization_header(key, secret):
        ts = int(time.time())
        msg = "%s:%s" % (key, ts)
        hmac_str = hmac.new(str.encode(secret), str.encode(msg), sha1).hexdigest()
        return f"CBX-HMAC Key={key} HMAC={hmac_str} TS={ts}"

    @staticmethod
    def with_auth_header(headers):
        headers['Authorization'] = API.get_authorization_header(*API.get_api_key_and_secret())
        return headers
