import urllib.request
import json
import urllib.error
import time
import jwt

def get_dummy_token():
    payload = {"sub": "DEMO_UNCLAIMED"}
    token = jwt.encode(payload, "secret", algorithm="HS256")
    return token

HEADERS = {
    "Authorization": f"Bearer {get_dummy_token()}"
}

endpoints = [
    "/api/v1/auth/me",
    "/api/v1/profile/",
    "/api/v1/doctors/",
    "/api/v1/labs/",
    "/api/v1/family/",
    "/api/v1/benefits/",
    "/api/v1/appointments/"
]

base_url = "http://localhost:8000"

print("Starting Endpoint Verification...\n")
success = True
patient_id = None

# First get auth/me to extract the user's UUID for the timeline endpoint
try:
    req = urllib.request.Request(f"{base_url}/api/v1/auth/me", headers=HEADERS)
    with urllib.request.urlopen(req) as response:
        body = response.read().decode('utf-8')
        data = json.loads(body)
        patient_id = data.get("id")
        print(f"[PASS] /api/v1/auth/me (Extracted ID: {patient_id})")
except Exception as e:
    print(f"[FAIL] /api/v1/auth/me (Error: {e})")
    success = False

if patient_id:
    endpoints.insert(1, f"/api/v1/timeline/timeline?patient_id={patient_id}")

for endpoint in endpoints:
    if "auth/me" in endpoint:
        continue # already tested
        
    url = f"{base_url}{endpoint}"
    req = urllib.request.Request(url, headers=HEADERS)
    
    try:
        start_time = time.time()
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            elapsed = (time.time() - start_time) * 1000
            
            try:
                data = json.loads(body)
                print(f"[PASS] {endpoint}")
                print(f"   Status: {status} ({elapsed:.1f}ms)")
                print(f"   Items returned: {len(data) if isinstance(data, list) else 1}")
                print(f"   Sample: {str(data)[:150]}...")
            except json.JSONDecodeError:
                print(f"[FAIL] {endpoint} (Invalid JSON)")
                success = False
                
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {endpoint} (HTTP {e.code})")
        print(f"   Body: {e.read().decode('utf-8')}")
        success = False
    except Exception as e:
        print(f"[FAIL] {endpoint} (Error: {e})")
        success = False
    print("-" * 50)

if not success:
    print("Verification completed with ERRORS.")
    exit(1)
else:
    print("Verification completed SUCCESSFULLY.")
