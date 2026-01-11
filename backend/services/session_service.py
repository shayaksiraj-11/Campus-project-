from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class SessionService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.sessions = db.sessions
        self.messages = db.messages
        self.documents = db.documents
    
    async def create_session(self, title: str = "New Chat", mode: str = "general") -> Dict:
        """Create a new chat session"""
        session = {
            "title": title,
            "mode": mode,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        result = await self.sessions.insert_one(session)
        session['id'] = str(result.inserted_id)
        del session['_id']
        return session
    
    async def get_sessions(self, limit: int = 50) -> List[Dict]:
        """Get all sessions"""
        sessions = await self.sessions.find(
            {},
            {"_id": 0}
        ).sort("updated_at", -1).limit(limit).to_list(limit)
        
        for session in sessions:
            if '_id' in session:
                session['id'] = str(session['_id'])
                del session['_id']
        
        return sessions
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Get a specific session"""
        session = await self.sessions.find_one({"id": session_id}, {"_id": 0})
        return session
    
    async def update_session(self, session_id: str, title: str = None, mode: str = None):
        """Update session details"""
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if title:
            update_data["title"] = title
        if mode:
            update_data["mode"] = mode
        
        await self.sessions.update_one(
            {"id": session_id},
            {"$set": update_data}
        )
    
    async def add_message(self, session_id: str, role: str, content: str, metadata: Dict = None) -> Dict:
        """Add a message to session"""
        message = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.messages.insert_one(message)
        del message['_id']
        
        await self.sessions.update_one(
            {"id": session_id},
            {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return message
    
    async def get_messages(self, session_id: str, limit: int = 100) -> List[Dict]:
        """Get messages for a session"""
        messages = await self.messages.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1).limit(limit).to_list(limit)
        return messages
    
    async def save_document(self, session_id: str, filename: str, file_path: str, text_content: str, chunks: List[str]) -> Dict:
        """Save document metadata"""
        document = {
            "session_id": session_id,
            "filename": filename,
            "file_path": file_path,
            "text_content": text_content,
            "chunks": chunks,
            "upload_date": datetime.now(timezone.utc).isoformat()
        }
        result = await self.documents.insert_one(document)
        document['id'] = str(result.inserted_id)
        del document['_id']
        return document
    
    async def get_document(self, session_id: str) -> Optional[Dict]:
        """Get document for a session"""
        document = await self.documents.find_one({"session_id": session_id}, {"_id": 0})
        return document