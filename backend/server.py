from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid

from services.openrouter_service import OpenRouterService
from services.pdf_service import PDFService
from services.session_service import SessionService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

openrouter_service = OpenRouterService()
pdf_service = PDFService()
session_service = SessionService(db)

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Chat"
    mode: Optional[str] = "general"

class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "allenai/molmo-2-8b:free"
    temperature: Optional[float] = 0.7

class GenerateQARequest(BaseModel):
    model: Optional[str] = "allenai/molmo-2-8b:free"
    num_questions: Optional[int] = 5

class ResearchRequest(BaseModel):
    session_id: str
    query: str
    model: Optional[str] = "allenai/molmo-2-8b:free"

class TranslateRequest(BaseModel):
    session_id: str
    target_language: str
    model: Optional[str] = "allenai/molmo-2-8b:free"

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ChatPDF"}

@api_router.get("/models")
async def get_models():
    return {"models": openrouter_service.get_available_models()}

@api_router.post("/sessions")
async def create_session(request: CreateSessionRequest):
    session = await session_service.create_session(request.title, request.mode)
    return session

@api_router.get("/sessions")
async def get_sessions():
    sessions = await session_service.get_sessions()
    return {"sessions": sessions}

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@api_router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    messages = await session_service.get_messages(session_id)
    return {"messages": messages}

@api_router.post("/sessions/{session_id}/upload")
async def upload_pdf(session_id: str, file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        content = await file.read()
        file_path = await pdf_service.save_file(f"{session_id}_{file.filename}", content)
        
        text_content = await pdf_service.extract_text(file_path)
        chunks = pdf_service.chunk_text(text_content)
        
        document = await session_service.save_document(
            session_id, file.filename, file_path, text_content, chunks
        )
        
        await session_service.update_session(session_id, mode="pdf")
        
        return {
            "message": "PDF uploaded successfully",
            "document": {
                "filename": file.filename,
                "pages": len(chunks),
                "size": len(text_content)
            }
        }
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sessions/{session_id}/chat")
async def chat(session_id: str, request: ChatRequest):
    try:
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        await session_service.add_message(session_id, "user", request.message)
        
        messages = await session_service.get_messages(session_id)
        
        context_messages = [{"role": msg["role"], "content": msg["content"]} for msg in messages[-10:]]
        
        if session.get("mode") == "pdf":
            document = await session_service.get_document(session_id)
            if document:
                context = "\n\n".join(document.get("chunks", [])[:5])
                system_message = {
                    "role": "system",
                    "content": f"You are a helpful AI assistant. Answer questions based on this document context:\n\n{context}"
                }
                context_messages = [system_message] + context_messages
        else:
            system_message = {
                "role": "system",
                "content": "You are BalochAI, a helpful and knowledgeable AI assistant. Provide clear, accurate, and helpful responses."
            }
            context_messages = [system_message] + context_messages
        
        response = await openrouter_service.chat_completion(
            context_messages,
            model=request.model,
            temperature=request.temperature
        )
        
        await session_service.add_message(session_id, "assistant", response)
        
        return {"response": response}
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sessions/{session_id}/generate-qa")
async def generate_qa(session_id: str, request: GenerateQARequest):
    try:
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        document = await session_service.get_document(session_id)
        if not document:
            raise HTTPException(status_code=400, detail="No document found for this session")
        
        context = "\n\n".join(document.get("chunks", [])[:10])
        
        messages = [
            {
                "role": "system",
                "content": f"Generate {request.num_questions} important questions and their answers from the following document. Format each as Q: question\nA: answer\n\n"
            },
            {"role": "user", "content": context}
        ]
        
        response = await openrouter_service.chat_completion(
            messages,
            model=request.model,
            temperature=0.7,
            max_tokens=3000
        )
        
        return {"qa_content": response}
    except Exception as e:
        logging.error(f"Q&A generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/research")
async def research(request: ResearchRequest):
    try:
        session = await session_service.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        document = await session_service.get_document(request.session_id)
        if not document:
            raise HTTPException(status_code=400, detail="No document found for this session")
        
        context = "\n\n".join(document.get("chunks", [])[:15])
        
        messages = [
            {
                "role": "system",
                "content": "You are a research analyst. Provide detailed analysis, key insights, and summaries based on the document."
            },
            {
                "role": "user",
                "content": f"Document content:\n{context}\n\nResearch query: {request.query}"
            }
        ]
        
        response = await openrouter_service.chat_completion(
            messages,
            model=request.model,
            temperature=0.5,
            max_tokens=3000
        )
        
        return {"analysis": response}
    except Exception as e:
        logging.error(f"Research error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/translate")
async def translate(request: TranslateRequest):
    try:
        session = await session_service.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        document = await session_service.get_document(request.session_id)
        if not document:
            raise HTTPException(status_code=400, detail="No document found for this session")
        
        context = "\n\n".join(document.get("chunks", [])[:10])
        
        messages = [
            {
                "role": "system",
                "content": f"Translate the following document to {request.target_language}. Maintain the structure and meaning."
            },
            {"role": "user", "content": context}
        ]
        
        response = await openrouter_service.chat_completion(
            messages,
            model=request.model,
            temperature=0.3,
            max_tokens=4000
        )
        
        return {"translation": response}
    except Exception as e:
        logging.error(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown():
    await openrouter_service.close()
    client.close()