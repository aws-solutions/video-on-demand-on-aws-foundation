import os
import unittest
from unittest import mock

import lambda_function


@mock.patch.dict(os.environ, {
    'STREAM_HOST': "https://video.skyfish.com"
})
class MyTestCase(unittest.TestCase):

    def test_format_for_stream_host(self):
        url = "https://d1psf2h8e73cwr.cloudfront.net/9ba6013d-445c-424f-9a6a-408b0518297c/AppleHLS1/stream-123-456.m3u8"
        formatted_url = lambda_function.format_for_stream_host(url)
        self.assertEqual(
            "https://video.skyfish.com/9ba6013d-445c-424f-9a6a-408b0518297c/AppleHLS1/stream-123-456.m3u8",
            formatted_url
        )


if __name__ == '__main__':
    unittest.main()
