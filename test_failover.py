import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock

from dotenv import load_dotenv
load_dotenv('backend/.env')

sys.path.insert(0, os.path.abspath('backend'))

from app.infrastructure.database.session import AsyncSessionLocal
from app.modules.ai.service import AIChatService
from app.modules.ai.schemas import AIChatRequest
from app.infrastructure.database.models import User, RoleEnum

class MockTogetherProvider:
    async def generate_content(self, model, messages, tools=None):
        mock_response = MagicMock()
        mock_message = MagicMock()
        mock_message.content = "FAILOVER OK (from Mock Together)"
        mock_choice = MagicMock()
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        return mock_response
        
    async def generate_content_stream(self, model, messages, tools=None):
        class MockChunk:
            def __init__(self, content):
                self.choices = [MagicMock()]
                self.choices[0].delta.content = content
        yield MockChunk("FAILOVER ")
        yield MockChunk("OK ")
        yield MockChunk("(from Mock Together stream)")

async def test_failover():
    async with AsyncSessionLocal() as db:
        service = AIChatService(db)
        
        # Break Groq intentionally
        if service.providers and service.providers[0][0] == 'Groq':
            service.providers[0][1].client.api_key = 'invalid_key_to_force_failure'
            print('Forced Groq to fail')
            
        # Add Mock Together provider
        service.providers.append(('Together (Mock)', MockTogetherProvider(), 'mock-model'))
        
        # Get a real user to avoid auth issues in DB
        from sqlalchemy import select
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        
        if not user:
            print('No user found in DB. Test skipped.')
            return
            
        req = AIChatRequest(message='Hello, this is a failover test.', client_role='PATIENT')
        
        print('\n--- Testing get_chat_response ---')
        try:
            res = await service.get_chat_response(req, user)
            print('Response received:', res.answer)
        except Exception as e:
            print('Test failed with exception:', e)
            
        print('\n--- Testing get_chat_stream_response ---')
        from app.modules.ai.schemas import AIStreamRequest
        req_stream = AIStreamRequest(message='Hello', client_role='PATIENT')
        try:
            async for chunk in service.get_chat_stream_response(req_stream, user):
                print('Stream chunk:', chunk.strip())
        except Exception as e:
            print('Stream Test failed with exception:', e)

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_failover())
