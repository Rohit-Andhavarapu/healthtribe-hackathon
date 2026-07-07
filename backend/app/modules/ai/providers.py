import logging
import json
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class BaseLLMProvider(ABC):
    """
    Abstract base class for all LLM providers.
    The project DOES NOT use OpenAI as an inference provider.
    The AI Service remains completely provider-agnostic.
    """
    
    @abstractmethod
    async def generate_content(self, model: str, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None) -> Any:
        pass
        
    @abstractmethod
    async def generate_content_stream(self, model: str, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None) -> AsyncGenerator[Any, None]:
        pass

class OpenAICompatibleClient(BaseLLMProvider):
    """
    Transport client that implements the OpenAI-compatible API specification.
    This client is strictly for HTTP communication with API endpoints that support
    the OpenAI specification (e.g. Groq, OpenRouter, Together AI).
    Inference is NEVER sent to OpenAI.
    """
    def __init__(self, base_url: str, api_key: str):
        self.client = AsyncOpenAI(base_url=base_url, api_key=api_key)
        
    async def generate_content(self, model: str, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None) -> Any:
        kwargs = {
            "model": model,
            "messages": messages,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"
            
        response = await self.client.chat.completions.create(**kwargs)
        return response

    async def generate_content_stream(self, model: str, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None) -> AsyncGenerator[Any, None]:
        kwargs = {
            "model": model,
            "messages": messages,
            "stream": True
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"
            
        stream = await self.client.chat.completions.create(**kwargs)
        async for chunk in stream:
            yield chunk


class GroqProvider(OpenAICompatibleClient):
    """Primary inference provider using Groq."""
    def __init__(self, api_key: str):
        super().__init__(base_url="https://api.groq.com/openai/v1", api_key=api_key)


class OpenRouterProvider(OpenAICompatibleClient):
    """Fallback inference provider using OpenRouter."""
    def __init__(self, api_key: str):
        super().__init__(base_url="https://openrouter.ai/api/v1", api_key=api_key)


class TogetherProvider(OpenAICompatibleClient):
    """Fallback inference provider using Together AI."""
    def __init__(self, api_key: str):
        super().__init__(base_url="https://api.together.xyz/v1", api_key=api_key)
