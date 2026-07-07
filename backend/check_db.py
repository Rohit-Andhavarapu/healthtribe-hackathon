import asyncio
import sys
sys.path.append('.')
from app.infrastructure.database.session import engine
from sqlalchemy import text

async def test():
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT id, clerk_user_id, role FROM users'))
        rows = res.fetchall()
        for r in rows:
            print(r)
        
        # Let's also check patient profiles
        res2 = await conn.execute(text('SELECT user_id, demographics FROM patient_profiles'))
        print("Profiles:", res2.fetchall())

asyncio.run(test())
