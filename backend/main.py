"""
FastAPI backend for PolicyPal RAG system with agentic debate.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from services.document_processor import DocumentProcessor
from services.rag_service import RAGService
from services.agentic_debate import AgenticDebateService

load_dotenv()

app = FastAPI(title="PolicyPal API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9002", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
document_processor = DocumentProcessor()
rag_service = RAGService()
debate_service = AgenticDebateService()


class QueryRequest(BaseModel):
    question: str
    user_id: Optional[str] = None


class QueryResponse(BaseModel):
    answer: str
    it_context: List[str]
    hr_context: List[str]
    sources: List[str]
    it_expert_response: Optional[str] = None
    hr_expert_response: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "PolicyPal API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    policy_area: str = "General"
):
    """
    Upload a policy document (PDF or TXT) and process it into the vector store.
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_ext = os.path.splitext(file.filename)[1].lower()
        supported_formats = [".pdf", ".txt", ".jpg", ".jpeg", ".png", ".bmp", ".gif"]
        if file_ext not in supported_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Supported formats: {', '.join(supported_formats)}"
            )
        
        # Validate policy area
        if policy_area not in ["IT", "HR", "General"]:
            raise HTTPException(
                status_code=400,
                detail="policy_area must be one of: IT, HR, General"
            )
        
        # Process document
        result = await document_processor.process_document(
            file=file,
            policy_area=policy_area
        )
        
        return {
            "message": "Document processed successfully",
            "document_id": result["document_id"],
            "chunks_created": result["chunks_created"],
            "policy_area": policy_area
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/query", response_model=QueryResponse)
async def query_policy(query: QueryRequest):
    """
    Query the policy system using the agentic debate approach.
    Returns a synthesized answer from IT and HR policy experts.
    """
    try:
        result = await debate_service.process_query(query.question)
        
        return QueryResponse(
            answer=result["answer"],
            it_context=result["it_context"],
            hr_context=result["hr_context"],
            sources=result["sources"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents")
async def list_documents():
    """
    List all uploaded documents.
    """
    try:
        documents = await document_processor.list_documents()
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a document and its associated chunks from the vector store.
    """
    try:
        await document_processor.delete_document(document_id)
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

