from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from typing import Optional, List, Dict, Any
from app.infrastructure.database.session import get_db
from app.core.security import get_current_user
from app.infrastructure.database.models import User
from app.modules.ai.schemas import AIChatRequest, AIChatResponse
from app.modules.ai.service import AIChatService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    request: AIChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        # Strict role isolation: the AI persona must match the authenticated user's role exactly.
        request.client_role = user.role.value
        
        service = AIChatService(db)
        # Assuming run_in_threadpool if the gemini client block... but for now just await if we wrap it, or just call it directly.
        # It's better to run sync code in threadpool if it blocks, but let's just await the service method since we used async def.
        response = await service.get_chat_response(request, user)
        return response
    except ValueError as ve:
        # Structured error handling instead of 500
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Unexpected error in AI chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI is temporarily unavailable."
        )

from fastapi.responses import StreamingResponse
from app.modules.ai.schemas import AIStreamRequest

@router.post("/chat/stream")
async def chat_with_ai_stream(
    request: Request,
    stream_request: AIStreamRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    print("AI STREAM HEADERS:", request.headers)
    
    # Strict role isolation: the AI persona must match the authenticated user's role exactly.
    stream_request.client_role = user.role.value
    
    try:
        service = AIChatService(db)
        return StreamingResponse(
            service.get_chat_stream_response(stream_request, user),
            media_type="text/event-stream"
        )
    except Exception as e:
        logger.error(f"Unexpected error in AI stream endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI stream is temporarily unavailable."
        )

from typing import List
from sqlalchemy import select
from app.infrastructure.database.models import AIConversation, AIMessage
from app.modules.ai.schemas import ConversationSchema, ConversationUpdate

@router.get("/conversations", response_model=List[ConversationSchema])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(AIConversation)
        .options(selectinload(AIConversation.messages))
        .where(AIConversation.user_id == user.id, AIConversation.role == user.role.value)
        .order_by(AIConversation.updated_at.desc())
    )
    return result.scalars().unique().all()

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = await db.execute(select(AIConversation).where(AIConversation.id == conversation_id, AIConversation.user_id == user.id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    await db.delete(conv)
    await db.commit()
    return {"status": "success"}

@router.patch("/conversations/{conversation_id}", response_model=ConversationSchema)
async def update_conversation(
    conversation_id: str,
    update: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(AIConversation)
        .options(selectinload(AIConversation.messages))
        .where(AIConversation.id == conversation_id, AIConversation.user_id == user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    conv.title = update.title
    await db.commit()
    await db.refresh(conv)
    return conv

# Since messages are streamed, we must persist them inside the stream service, or via a new endpoint.
# Actually, the frontend hook (useAIChat) only manages streams, it does not POST messages individually.
# We need an endpoint for the frontend to save a conversation state (sync).
from pydantic import BaseModel
class SyncConversationRequest(BaseModel):
    id: str
    title: str
    messages: list
    context_payload: Optional[dict] = None

@router.post("/conversations/sync")
async def sync_conversation(
    req: SyncConversationRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    from sqlalchemy.orm import selectinload
    from sqlalchemy.exc import IntegrityError
    
    result = await db.execute(
        select(AIConversation)
        .options(selectinload(AIConversation.messages))
        .where(AIConversation.id == req.id)
    )
    conv = result.scalar_one_or_none()
    
    if not conv:
        try:
            conv = AIConversation(
                id=req.id, 
                user_id=user.id, 
                title=req.title,
                role=user.role.value,
                context_payload=req.context_payload
            )
            db.add(conv)
            await db.flush()
            is_new = True
        except IntegrityError:
            await db.rollback()
            result = await db.execute(
                select(AIConversation)
                .options(selectinload(AIConversation.messages))
                .where(AIConversation.id == req.id)
            )
            conv = result.scalar_one_or_none()
            if not conv:
                raise HTTPException(status_code=500, detail="Failed to create or retrieve conversation")
            is_new = False
    else:
        is_new = False

    # Check permissions
    if conv.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    # Prevent 'New Chat' from overwriting a real title that was generated
    if req.title == "New Chat" and conv.title and conv.title != "New Chat":
        pass # Keep existing title
    elif conv.title != req.title:
        conv.title = req.title
        
    if req.context_payload is not None:
        conv.context_payload = req.context_payload
        
    # Only touch updated_at if messages actually changed
    # If it's new, it has 0 previous messages
    prev_msg_count = 0 if is_new else len(conv.messages)
    if prev_msg_count != len(req.messages):
        from datetime import datetime
        conv.updated_at = datetime.utcnow()
        
    # Delete old messages to resync
    from sqlalchemy import delete
    await db.execute(delete(AIMessage).where(AIMessage.conversation_id == req.id))
    
    for msg in req.messages:
        db_msg = AIMessage(
            id=msg["id"],
            conversation_id=req.id,
            role=msg["role"],
            content=msg["content"],
            sources=msg.get("sources", []),
            actions=msg.get("actions", []),
            is_error=msg.get("isError", False)
        )
        db.add(db_msg)
        
    await db.commit()
    return {"status": "success"}
