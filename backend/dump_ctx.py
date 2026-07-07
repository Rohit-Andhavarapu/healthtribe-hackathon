import asyncio
import sys
sys.path.append('.')
from app.infrastructure.database.session import AsyncSessionLocal
from app.modules.ai.service import AIChatService
from app.modules.auth.service import AuthService

async def run():
    async with AsyncSessionLocal() as db:
        user = await AuthService(db).get_user_by_clerk_id("user_3G3Gk02bT5swCKnlo2UQW2jVGqP")
        ctx, sources = await AIChatService(db)._build_context(user)
        print("======== CONTEXT ========")
        print(ctx)

asyncio.run(run())
