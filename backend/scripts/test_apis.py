import urllib.request
import urllib.error
import jwt
import json

BASE_URL = "http://localhost:8000/api/v1"

def get_dummy_token():
    payload = {"sub": "DEMO_UNCLAIMED"}
    token = jwt.encode(payload, "secret", algorithm="HS256")
    return token

HEADERS = {
    "Authorization": f"Bearer {get_dummy_token()}"
}

endpoints = [
    "/auth/me",
    "/profile/",
    "/timeline/timeline",
    "/doctors/",
    "/appointments/",
    "/benefits/",
    "/family/",
    "/labs/"
]

def test_endpoints():
    print("--- API VERIFICATION REPORT ---\n")
    for ep in endpoints:
        print(f"Executing: GET {BASE_URL}{ep}")
        req = urllib.request.Request(f"{BASE_URL}{ep}", headers=HEADERS)
        try:
            with urllib.request.urlopen(req) as response:
                print(f"Status Code: {response.status}")
                data = json.loads(response.read().decode())
                print("JSON Response:")
                print(json.dumps(data, indent=2))
        except urllib.error.HTTPError as e:
            print(f"Status Code: {e.code}")
            print(f"Error Reason: {e.reason}")
            try:
                print(json.loads(e.read().decode()))
            except:
                print(e.read().decode())
        except Exception as e:
            print(f"Failed to fetch: {e}")
            
        print("-" * 50 + "\n")

if __name__ == "__main__":
    test_endpoints()
