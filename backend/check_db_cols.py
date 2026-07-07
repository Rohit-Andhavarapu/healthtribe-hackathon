import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
sys.path.insert(0, '.')

from app.core.settings import get_settings

settings = get_settings()

async def check_cols():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.connect() as conn:
        r1 = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'patient_profiles' ORDER BY column_name"
        ))
        print("patient_profiles columns:", [r[0] for r in r1])
        
        r2 = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'consent_records' ORDER BY column_name"
        ))
        print("consent_records columns:", [r[0] for r in r2])
        
        r3 = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'abha_identities' ORDER BY column_name"
        ))
        print("abha_identities columns:", [r[0] for r in r3])

asyncio.run(check_cols())
