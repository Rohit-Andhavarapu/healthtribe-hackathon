from uuid import UUID
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AIChatRequest(BaseModel):
    message: str = Field(..., description="The user's message to the AI Assistant")
    client_role: Optional[str] = Field("PATIENT", description="The role context requested by the frontend ('PATIENT' or 'DOCTOR')")

class AIChatResponse(BaseModel):
    answer: str = Field(..., description="The AI's response in markdown format")
    sources: List[str] = Field(..., description="List of data sources used to answer the query")

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'model'")
    content: str = Field(..., description="The message content")

class AIStreamRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation history including the latest message")
    conversation_id: Optional[str] = None
    context_payload: Optional[Dict[str, Any]] = None
    client_role: Optional[str] = Field("PATIENT", description="The role context requested by the frontend ('PATIENT' or 'DOCTOR')")

class AIStreamChunk(BaseModel):
    type: str = Field(..., description="'text' or 'action' or 'sources' or 'error' or 'done' or 'title'")
    content: Optional[str] = None
    action_type: Optional[str] = None
    action_payload: Optional[Dict[str, Any]] = None
    sources: Optional[List[str]] = None
    title: Optional[str] = None

from datetime import datetime

class MessageSchema(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[List[str]] = []
    actions: Optional[list] = []
    is_error: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationSchema(BaseModel):
    id: str
    title: str
    updated_at: datetime
    messages: List[MessageSchema] = []
    
    class Config:
        from_attributes = True

class ConversationUpdate(BaseModel):
    title: str
