"""
Document processing service for chunking and embedding policy documents.
Supports PDF, TXT, and image formats (JPEG/PNG) with OCR.
"""
import os
import uuid
import aiofiles
from typing import Dict, List, Optional
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from PIL import Image
import easyocr

# Initialize OCR reader (lazy load)
_ocr_reader = None

def get_ocr_reader():
    """Lazy load OCR reader."""
    global _ocr_reader
    if _ocr_reader is None:
        print("Initializing OCR reader (first time may take a moment)...")
        _ocr_reader = easyocr.Reader(['en'], gpu=False)  # Use GPU if available
    return _ocr_reader

# Initialize embedding model
EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(anonymized_telemetry=False)
)


class DocumentProcessor:
    """Processes documents: extracts text, chunks, embeds, and stores in ChromaDB."""
    
    def __init__(self):
        self.upload_dir = "./uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs("./chroma_db", exist_ok=True)
        
        # Get or create collections for each policy area
        self.collections = {
            "IT": chroma_client.get_or_create_collection(
                name="it_policy",
                metadata={"description": "IT Policy documents"}
            ),
            "HR": chroma_client.get_or_create_collection(
                name="hr_policy",
                metadata={"description": "HR Policy documents"}
            ),
            "General": chroma_client.get_or_create_collection(
                name="general_policy",
                metadata={"description": "General Policy documents"}
            ),
        }
    
    async def process_document(
        self,
        file,
        policy_area: str
    ) -> Dict:
        """
        Process uploaded document: extract text, chunk, embed, and store.
        
        Args:
            file: Uploaded file object
            policy_area: "IT", "HR", or "General"
        
        Returns:
            Dict with document_id and chunks_created
        """
        document_id = str(uuid.uuid4())
        file_path = os.path.join(self.upload_dir, f"{document_id}{os.path.splitext(file.filename)[1]}")
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Extract text based on file type
        text = await self._extract_text(file_path)
        
        # Chunk the text
        chunks = self._chunk_text(text, chunk_size=500, chunk_overlap=100)
        
        # Embed and store chunks
        collection = self.collections[policy_area]
        embeddings = EMBEDDING_MODEL.encode(chunks).tolist()
        
        ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "document_id": document_id,
                "filename": file.filename,
                "policy_area": policy_area,
                "chunk_index": i
            }
            for i in range(len(chunks))
        ]
        
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        
        return {
            "document_id": document_id,
            "chunks_created": len(chunks),
            "file_path": file_path
        }
    
    async def _extract_text(self, file_path: str) -> str:
        """Extract text from PDF, TXT, or image file (JPEG/PNG with OCR)."""
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == ".pdf":
            doc = fitz.open(file_path)
            text = "\n".join([page.get_text() for page in doc])
            doc.close()
            return text
        
        elif file_ext == ".txt":
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                return await f.read()
        
        elif file_ext in [".jpg", ".jpeg", ".png", ".bmp", ".gif"]:
            # Use OCR for image files
            return self._extract_text_from_image(file_path)
        
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
    
    def _extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using OCR (synchronous)."""
        try:
            # Load image to verify it's valid
            image = Image.open(image_path)
            image.verify()
            
            # Use EasyOCR for text extraction
            reader = get_ocr_reader()
            results = reader.readtext(image_path)
            
            # Combine all detected text
            text_lines = []
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Filter low-confidence detections
                    text_lines.append(text)
            
            extracted_text = "\n".join(text_lines)
            
            if not extracted_text.strip():
                raise ValueError("No text could be extracted from the image. Please ensure the image contains readable text.")
            
            return extracted_text
        except Exception as e:
            raise ValueError(f"OCR extraction failed: {str(e)}")
    
    def _chunk_text(
        self,
        text: str,
        chunk_size: int = 500,
        chunk_overlap: int = 100
    ) -> List[str]:
        """
        Split text into overlapping chunks.
        
        Args:
            text: Text to chunk
            chunk_size: Target size of each chunk (in characters)
            chunk_overlap: Overlap between chunks (in characters)
        
        Returns:
            List of text chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings near the end
                for i in range(end, max(start, end - 100), -1):
                    if text[i] in '.!?\n':
                        end = i + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - chunk_overlap
        
        return chunks
    
    async def list_documents(self) -> List[Dict]:
        """List all documents in the vector store."""
        all_documents = []
        
        for policy_area, collection in self.collections.items():
            results = collection.get()
            
            # Get unique document IDs
            doc_ids = set()
            for metadata in results.get("metadatas", []):
                if metadata:
                    doc_ids.add(metadata.get("document_id"))
            
            for doc_id in doc_ids:
                # Get first chunk metadata for document info
                chunks = collection.get(
                    where={"document_id": doc_id},
                    limit=1
                )
                if chunks.get("metadatas") and chunks["metadatas"]:
                    metadata = chunks["metadatas"][0]
                    all_documents.append({
                        "document_id": doc_id,
                        "filename": metadata.get("filename", "Unknown"),
                        "policy_area": policy_area,
                        "chunks_count": len(collection.get(where={"document_id": doc_id})["ids"])
                    })
        
        return all_documents
    
    async def delete_document(self, document_id: str):
        """Delete a document and all its chunks from all collections."""
        for collection in self.collections.values():
            collection.delete(where={"document_id": document_id})
        
        # Delete file if exists
        for file in os.listdir(self.upload_dir):
            if file.startswith(document_id):
                os.remove(os.path.join(self.upload_dir, file))

