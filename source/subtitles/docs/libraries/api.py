import urllib
from urllib.request import urlopen
from urllib.request import Request
import hmac
import time
from hashlib import sha1
import json

class API:
    def __init__(self, key, secret, base_url):
        self.key = key
        self.secret = secret
        self.base_url = base_url

    def get_authorization_header(self, key, secret):
        ts = int(time.time())
        msg = "%s:%s" % (key, ts)
        hmac_str = hmac.new(str.encode(secret), str.encode(msg), sha1).hexdigest()
        return "CBX-HMAC Key=%s HMAC=%s TS=%s" % (key, hmac_str, ts)

    def make_get(self, url):
        return self.parse_output(self.make_request(url, 'GET', None))

    def make_delete(self, url):
        return self.parse_output(self.make_request(url, 'DELETE', None))

    def make_post(self, url, data):
        return self.parse_output(self.make_request(url, 'POST', data))

    def parse_output(self, req):
        try:
            response = urlopen(req)
            response_data = json.loads(response.read().decode('utf-8'))
            return response_data
        except urllib.error.HTTPError as e:
            result = e.read().decode()
            raise APIError(result, e.code) from None

    def make_request(self, url, method, data, add_auth = []):
        req = Request(url = self.base_url + url, method = method, data=data)
        auth_str = self.get_authorization_header(self.key, self.secret)
        for str in add_auth:
            auth_str += ", {}".format(str)
        req.add_header('Authorization', auth_str)
        print(req)
        return req

class APIError(Exception):
    def __init__(self, data, code):
        self.raw_error = data
        self.code = code
        self.parsed_error = None
        try:
            self.parsed_error = json.loads(data)
        except Exception:
            pass

    def get_raw_error(self):
        return self.raw_error

    def get_parsed_error(self):
        return self.parsed_error
