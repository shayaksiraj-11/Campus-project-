import httpx
import os
from typing import List, Dict, AsyncGenerator
import json
import logging

logger = logging.getLogger(__name__)

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

AVAILABLE_MODELS = [
    {"id": "allenai/molmo-2-8b:free", "name": "Molmo 2 8B", "provider": "AllenAI"},
    {"id": "xiaomi/mimo-v2-flash:free", "name": "Mimo V2 Flash", "provider": "Xiaomi"},
    {"id": "mistralai/devstral-2512:free", "name": "Devstral 2512", "provider": "Mistral AI"},
    {"id": "openai/gpt-oss-120b:free", "name": "GPT OSS 120B", "provider": "OpenAI"},
    {"id": "tngtech/deepseek-r1t2-chimera:free", "name": "DeepSeek R1T2 Chimera", "provider": "TNG Tech"}
]

class OpenRouterService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get('OPENROUTER_API_KEY')
        self.client = httpx.AsyncClient(timeout=120.0)
    
    def get_available_models(self) -> List[Dict]:
        """Return list of available models"""
        return AVAILABLE_MODELS
    
    async def chat_completion(self, messages: List[Dict], model: str = "allenai/molmo-2-8b:free", temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """Get chat completion from OpenRouter"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://chatpdf.com",
                "X-Title": "ChatPDF"
            }
            
            data = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = await self.client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            logger.error(f"OpenRouter API error: {str(e)}")
            raise Exception(f"Failed to get response from AI: {str(e)}")
    
    async def chat_completion_stream(self, messages: List[Dict], model: str = "allenai/molmo-2-8b:free", temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Get streaming chat completion from OpenRouter"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://chatpdf.com",
                "X-Title": "ChatPDF"
            }
            
            data = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "stream": True
            }
            
            async with self.client.stream(
                "POST",
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=data
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.strip():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                if chunk.get('choices') and len(chunk['choices']) > 0:
                                    delta = chunk['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            logger.error(f"OpenRouter streaming error: {str(e)}")
            raise Exception(f"Failed to stream response: {str(e)}")
    
    async def close(self):
        await self.client.aclose()