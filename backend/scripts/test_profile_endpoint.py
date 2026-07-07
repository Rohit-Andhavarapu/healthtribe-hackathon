import urllib.request
import json
import urllib.error

url = "http://localhost:8000/api/v1/profile/"

req = urllib.request.Request(url)
# The backend uses get_current_user which needs an authorization header? Wait, test_apis.py bypassed it by using a fake token or standard setup.
# Actually, the endpoints might fail without a token if auth is enforced. Let me just print out what the DB has in profiles table.
import sys
import os

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Connection error:", e)
