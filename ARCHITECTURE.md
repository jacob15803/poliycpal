# PolicyPal Architecture

## Overview

PolicyPal has been restructured from a simple Genkit-based Q&A system to a comprehensive RAG-based agentic debate system as specified in the requirements.

## Architecture Changes

### Previous Architecture (Removed)
- **Frontend**: Next.js with Genkit AI flows
- **Backend**: None (server actions with Genkit)
- **Data**: Hardcoded policy documents in `policies.ts`
- **AI**: Google Gemini via Genkit

### New Architecture (Implemented)

#### Frontend (Next.js)
- **Location**: `frontend/`
- **Features**:
  - User dashboard (`/dashboard`) for querying policies
  - Admin panel (`/admin`) for document upload
  - Firebase authentication
  - Query history tracking

#### Backend (FastAPI)
- **Location**: `backend/`
- **Structure**:
  ```
  backend/
  ├── main.py                    # FastAPI application
  ├── services/
  │   ├── document_processor.py  # Document ingestion & chunking
  │   ├── rag_service.py         # Vector retrieval
  │   └── agentic_debate.py      # Multi-agent system
  └── requirements.txt
  ```

## Components

### 1. Document Ingestion Pipeline

**Service**: `DocumentProcessor`

**Flow**:
1. Upload PDF/TXT file via admin panel
2. Extract text (PyMuPDF for PDFs, direct read for TXT)
3. Chunk text (500 chars, 100 overlap, sentence-aware)
4. Generate embeddings using SentenceTransformers (`all-MiniLM-L6-v2`)
5. Store in ChromaDB with metadata (document_id, filename, policy_area)

**Storage**:
- ChromaDB collections: `it_policy`, `hr_policy`, `general_policy`
- Uploaded files: `backend/uploads/`
- Vector DB: `backend/chroma_db/`

### 2. RAG Service

**Service**: `RAGService`

**Functionality**:
- Semantic search across policy areas
- Retrieves top-k most relevant chunks per area
- Uses cosine similarity on embeddings

### 3. Agentic Debate System

**Service**: `AgenticDebateService`

**Agents**:

1. **IT Policy Expert**
   - System prompt: Focuses on IT policies, security, devices, software
   - Input: User question + IT policy context chunks
   - Output: IT-focused analysis

2. **HR Policy Expert**
   - System prompt: Focuses on HR policies, benefits, leave, conduct
   - Input: User question + HR policy context chunks
   - Output: HR-focused analysis

3. **Coordinator**
   - System prompt: Synthesizes both perspectives, identifies conflicts/overlaps
   - Input: Original question + IT Expert response + HR Expert response
   - Output: Comprehensive final answer
   - Uses GPT-4o for synthesis

**Flow**:
```
User Question
    ↓
RAG Retrieval (IT + HR contexts)
    ↓
IT Expert Analysis ──┐
                     ├──→ Coordinator Synthesis → Final Answer
HR Expert Analysis ──┘
```

## API Endpoints

### `POST /api/documents/upload`
- Upload policy documents
- Form data: `file`, `policy_area`
- Returns: document_id, chunks_created

### `POST /api/query`
- Process user queries
- Request: `{ question: string, user_id?: string }`
- Response: `{ answer, it_context, hr_context, sources }`

### `GET /api/documents`
- List all uploaded documents

### `DELETE /api/documents/{document_id}`
- Delete document and its chunks

## Integration

### Frontend → Backend
- Next.js server actions call FastAPI endpoints
- API base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
- CORS enabled for localhost:9002 and localhost:3000

### Data Flow
1. Admin uploads documents → FastAPI processes → ChromaDB
2. User asks question → Next.js → FastAPI → Agentic debate → Answer
3. Answer stored in Firebase Firestore for history

## Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL`: FastAPI backend URL
- Firebase config variables

### Backend
- `OPENAI_API_KEY`: Required for GPT-4o coordinator

## File Changes Summary

### New Files
- `backend/main.py` - FastAPI application
- `backend/services/*.py` - Core services
- `frontend/app/admin/page.tsx` - Document upload UI
- `frontend/app/admin/layout.tsx` - Admin layout

### Modified Files
- `frontend/lib/actions.ts` - Updated to call FastAPI instead of Genkit
- `frontend/components/dashboard/answer-display.tsx` - Handle array sources
- `frontend/components/dashboard/header.tsx` - Added admin link

### Deprecated (Can be removed)
- `frontend/ai/genkit.ts` - No longer used
- `frontend/ai/flows/*.ts` - Replaced by FastAPI backend
- `frontend/lib/policies.ts` - Replaced by document upload system

## Next Steps

1. **Install backend dependencies**: `cd backend && pip install -r requirements.txt`
2. **Set up environment variables**: Add `OPENAI_API_KEY` to `backend/.env`
3. **Start backend**: `uvicorn main:app --reload --port 8000`
4. **Start frontend**: `npm run dev`
5. **Upload documents**: Navigate to `/admin` and upload policy documents
6. **Test queries**: Use `/dashboard` to ask questions

## Evaluation

The system now implements:
- ✅ Document ingestion with PDF/TXT support
- ✅ Local RAG pipeline (SentenceTransformers + ChromaDB)
- ✅ Agentic debate system (IT Expert, HR Expert, Coordinator)
- ✅ LangGraph-ready architecture (can be enhanced with actual graph)
- ✅ Multi-document synthesis capability

