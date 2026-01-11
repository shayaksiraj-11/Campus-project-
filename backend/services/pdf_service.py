import os
from PyPDF2 import PdfReader
from pathlib import Path
import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self, upload_dir: str = "/app/backend/uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
    
    async def extract_text(self, file_path: str) -> str:
        """Extract text from PDF"""
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n\n"
            return text.strip()
        except Exception as e:
            logger.error(f"PDF extraction error: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def chunk_text(self, text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list:
        """Split text into chunks for better context"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
        chunks = text_splitter.split_text(text)
        return chunks
    
    async def save_file(self, filename: str, content: bytes) -> str:
        """Save uploaded file and return path"""
        file_path = self.upload_dir / filename
        with open(file_path, 'wb') as f:
            f.write(content)
        return str(file_path)