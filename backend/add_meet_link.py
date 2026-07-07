import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://healthtribe:password@localhost:5433/healthtribe_db')
    async with engine.begin() as conn:
        await conn.execute(text('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meet_link VARCHAR;'))
    print('Done')

asyncio.run(main())
