import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJERU1PX1VOQ0xBSU1FRCJ9.0sJJxqlduMdMJwXkuMN9WENaX8x0cNi44mNskfZ1O5M"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}"
}

endpoints = [
    "/api/v1/auth/me",
    "/api/v1/profile",
    "/api/v1/timeline",
    "/api/v1/doctors",
    "/api/v1/labs",
    "/api/v1/family",
    "/api/v1/benefits",
    "/api/v1/appointments"
]

all_passed = True

for ep in endpoints:
    url = f"{BASE_URL}{ep}"
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"[OK] {ep}: HTTP 200 (Valid JSON)")
            except Exception as e:
                print(f"[FAIL] {ep}: HTTP 200 but INVALID JSON. {e}")
                all_passed = False
        else:
            print(f"[FAIL] {ep}: HTTP {response.status_code}")
            print(response.text)
            all_passed = False
    except Exception as e:
        print(f"[FAIL] {ep}: Request failed. {e}")
        all_passed = False

if not all_passed:
    sys.exit(1)
print("All endpoints tested successfully.")
