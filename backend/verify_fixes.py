import asyncio
import httpx
import jwt

BASE_URL = 'http://127.0.0.1:8000'

def tok(clerk_id, role):
    return jwt.encode({'sub': clerk_id, 'public_metadata': {'role': role}}, 'secret', algorithm='HS256')

async def run():
    headers = {'Authorization': f'Bearer {tok("user_2lK2S9gZ1Z2Z3Z4Z5Z6Z7Z8Z9Z0", "PATIENT")}'}
    async with httpx.AsyncClient(base_url=BASE_URL, headers=headers, follow_redirects=True) as c:
        # 1. Get user ID
        r = await c.get('/api/v1/auth/me')
        uid = r.json()['id']
        print(f'Patient DB ID: {uid}')

        # 2. Profile
        r = await c.get(f'/api/v1/profile/{uid}')
        print(f'Profile: {r.status_code} - {r.text[:100]}')

        # 3. Full OTP Flow
        print('\n--- OTP Flow ---')
        r = await c.post('/api/v1/abha/generate-otp')
        otp_data = r.json()
        otp = otp_data['otp']
        print(f'Generated OTP: {otp}')

        r = await c.post('/api/v1/abha/verify-otp', json={
            'otp': otp,
            'abha_number': '98-1234-5678-9012',
            'abha_address': 'test.patient@abdm'
        })
        print(f'Verify OTP: {r.status_code} - {r.text[:150]}')

        # 4. Import from Apollo
        print('\n--- Import Records ---')
        # Get hospital list
        r = await c.get('/api/v1/hospitals/')
        hospitals = r.json()
        apollo = next((h for h in hospitals if 'Apollo' in h['name']), hospitals[0])
        care = next((h for h in hospitals if 'Care' in h['name']), hospitals[1])
        print(f'Apollo ID: {apollo["id"]}, Care ID: {care["id"]}')

        r = await c.post('/api/v1/abha/import/me', json={'hospital_id': apollo['id']})
        print(f'Import Apollo: {r.status_code} - imported_count={r.json().get("imported_count")}')

        r = await c.post('/api/v1/abha/import/me', json={'hospital_id': care['id']})
        print(f'Import Care: {r.status_code} - imported_count={r.json().get("imported_count")}')

        # 5. Timeline
        print('\n--- Timeline ---')
        r = await c.get(f'/api/v1/timeline?patient_id={uid}')
        events = r.json()
        print(f'Total events: {len(events)}')
        types = {}
        for e in events:
            t = e.get('type', 'unknown')
            types[t] = types.get(t, 0) + 1
        for t, count in sorted(types.items()):
            print(f'  {t}: {count}')

        # 6. Consent flow
        print('\n--- Consent ---')
        r = await c.post('/api/v1/consent/request', json={'patient_id': uid, 'hospital_id': apollo['id']})
        print(f'Grant consent: {r.status_code} - {r.text[:100]}')
        consent_id = r.json().get('id')

        r = await c.get(f'/api/v1/consent/patient/{uid}')
        print(f'Consent list: {r.status_code} - {len(r.json())} consents')

        if consent_id:
            r = await c.post(f'/api/v1/consent/{consent_id}/revoke')
            print(f'Revoke consent: {r.status_code} - {r.text[:100]}')

        # 7. DB check
        print('\n--- DB Row Counts ---')
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy import text
        import sys
        sys.path.insert(0, '.')
        from app.core.settings import get_settings
        settings = get_settings()
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.connect() as conn:
            for table in ['abha_identities', 'consent_records', 'import_sessions', 'imported_health_records', 'timeline_events']:
                result = await conn.execute(text(f'SELECT COUNT(*) FROM {table}'))
                count = result.scalar()
                print(f'  {table}: {count} rows')

asyncio.run(run())
