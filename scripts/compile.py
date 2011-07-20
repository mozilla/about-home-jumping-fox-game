#!/usr/bin/python

import httplib, urllib, sys

file_number = len(sys.argv)
data = ''
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPConnection('closure-compiler.appspot.com')

for i in xrange(1, file_number):
    js_file = open(sys.argv[i])
    content = js_file.read()

    # Define the parameters for the POST request and encode them in
    # a URL-safe format.

    params = urllib.urlencode([
        ('js_code', content),
        ('compilation_level', 'WHITESPACE_ONLY'),
        ('output_format', 'text'),
        ('output_info', 'compiled_code'),
      ])

    # Always use the following value for the Content-type header.
    conn.request('POST', '/compile', params, headers)
    response = conn.getresponse()
    data = " ".join((data, response.read()))

print data
conn.close
