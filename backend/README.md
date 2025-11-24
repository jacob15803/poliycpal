# PolicyPal Backend

FastAPI backend for the PolicyPal RAG system with agentic debate architecture.

## Setup

1. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set environment variables**:
```bash
cp .env.example .env
# For testing: Leave LLM_PROVIDER=local (no API key needed)
# For production: Set LLM_PROVIDER=openai and add OPENAI_API_KEY
```

4. **Run the server**:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Architecture

### Services

- **DocumentProcessor**: Handles document upload, text extraction, chunking, and embedding storage in ChromaDB
- **RAGService**: Retrieves relevant chunks from ChromaDB based on semantic similarity
- **AgenticDebateService**: Orchestrates the multi-agent debate system:
  - IT Policy Expert
  - HR Policy Expert  
  - Coordinator (synthesizes final answer)

### Data Flow

1. **Document Upload**:
   - PDF/TXT → Text extraction → Chunking → Embedding → ChromaDB storage

2. **Query Processing**:
   - User question → RAG retrieval (IT + HR contexts) → IT Expert analysis → HR Expert analysis → Coordinator synthesis → Final answer

## Storage

- **ChromaDB**: Persistent vector store at `./chroma_db/`
- **Uploads**: Document files stored at `./uploads/`

## Dependencies

- FastAPI: Web framework
- ChromaDB: Vector database
- SentenceTransformers: Local embeddings
- PyMuPDF: PDF parsing
- Transformers: Local LLM models (DistilBART)
- PyTorch: Model inference
- LangChain/LangGraph: Agent orchestration
- OpenAI (optional): GPT-4o for production use

## LLM Configuration

The system supports two LLM providers:

1. **Local Model (Default)**: Uses DistilBART for testing
   - No API key required
   - Set `LLM_PROVIDER=local` in `.env`
   - Model downloads automatically on first use

2. **OpenAI (Production)**: Uses GPT-4o
   - Requires API key
   - Set `LLM_PROVIDER=openai` and `OPENAI_API_KEY=...` in `.env`
   - Better quality responses

Switching between providers only requires changing the `LLM_PROVIDER` environment variable.

