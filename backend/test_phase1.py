import asyncio
import httpx
import uuid
import jwt
import sys

BASE_URL = "http://127.0.0.1:8000"

def generate_token(clerk_id: str, role: str) -> str:
    payload = {
        "sub": clerk_id,
        "public_metadata": {"role": role}
    }
    return jwt.encode(payload, "secret", algorithm="HS256")

async def run_tests():
    patient_clerk_id = "user_2lK2S9gZ1Z2Z3Z4Z5Z6Z7Z8Z9Z0"
    token = generate_token(patient_clerk_id, "PATIENT")
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient(base_url=BASE_URL, headers=headers, follow_redirects=True) as client:
        # Get user from auth endpoint
        resp = await client.get("/api/v1/auth/me")
        if resp.status_code != 200:
            print("Failed to get auth me:", resp.text)
            return
        patient_id = resp.json()["id"]
        print("Patient ID:", patient_id)
        
        # 1. Link ABHA
        print("\n--- Testing ABHA Linking ---")
        link_data = {
            "abha_number": "98-7654-3210-9876",
            "abha_address": "test@abha"
        }
        resp = await client.post(f"/api/v1/abha/link/{patient_id}", json=link_data)
        print("Link ABHA:", resp.status_code, resp.text)
        
        # 2. Get Hospitals
        resp = await client.get("/api/v1/hospitals/")
        hospitals = resp.json()
        print("\nHospitals:", [h["name"] for h in hospitals])
        if not hospitals:
            print("No hospitals found!")
            return
        hospital_id = hospitals[0]["id"]
        
        # 3. Import Records
        print(f"\n--- Testing Import Records from {hospitals[0]['name']} ---")
        import_data = {
            "hospital_id": hospital_id,
            "consent_record_id": None
        }
        resp = await client.post(f"/api/v1/abha/import/{patient_id}", json=import_data)
        print("Import Records:", resp.status_code, resp.text)
        
        # 4. Check Timeline
        print("\n--- Testing Timeline ---")
        resp = await client.get(f"/api/v1/timeline/?patient_id={patient_id}")
        if resp.status_code != 200:
            print(f"Timeline error: {resp.status_code} {resp.text}")
        else:
            events = resp.json()
            print(f"Timeline Events: {len(events)}")
            for e in events:
                print(f"- {e.get('type')} ({e.get('category')})")

if __name__ == "__main__":
    asyncio.run(run_tests())
