# PolicyPal

A RAG-based policy question answering system with an agentic debate architecture. Employees can ask complex questions that span multiple policy documents, and the system uses specialized agents (IT Expert, HR Expert) with a Coordinator to synthesize comprehensive answers.

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15 with TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth
- **Features**:
  - User dashboard for querying policies
  - Admin panel for document upload
  - Query history tracking

### Backend (FastAPI)
- **Framework**: FastAPI
- **RAG Pipeline**:
  - Document chunking (500 chars, 100 overlap)
  - Local SentenceTransformers embeddings (`all-MiniLM-L6-v2`)
  - ChromaDB vector store (persistent)
- **Agentic Debate System** (LangGraph):
  - **IT Policy Expert**: Analyzes IT policy documents
  - **HR Policy Expert**: Analyzes HR policy documents
  - **Coordinator**: Synthesizes both perspectives using GPT-4o
- **Document Processing**: PyMuPDF for PDF parsing

## Setup

### Prerequisites
- Node.js 20+
- Python 3.10+
- OpenAI API key (for GPT-4o)

### Frontend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase config and API URL

# Run development server
npm run dev
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your OPENAI_API_KEY

# Run FastAPI server
uvicorn main:app --reload --port 8000
```

### Environment Variables

**Frontend (.env.local)**:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env)**:
```
# For testing (no API key needed)
LLM_PROVIDER=local
LOCAL_MODEL_NAME=sshleifer/distilbart-cnn-12-6

# For production (when you get OpenAI API key)
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-4o
```

## Usage

### Admin Panel
1. Navigate to `/admin`
2. Upload policy documents (PDF or TXT)
3. Select policy area (IT, HR, or General)
4. Documents are automatically chunked, embedded, and stored in ChromaDB

### Querying
1. Navigate to `/dashboard`
2. Ask a question (e.g., "What is our policy on remote work and using personal devices?")
3. The system:
   - Retrieves relevant chunks from IT and HR policy areas
   - IT Expert analyzes IT policy context
   - HR Expert analyzes HR policy context
   - Coordinator synthesizes a comprehensive answer

## Project Structure

```
.
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── services/
│   │   ├── document_processor.py  # Document chunking & embedding
│   │   ├── rag_service.py         # Vector retrieval
│   │   └── agentic_debate.py      # Multi-agent debate system
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── admin/              # Admin panel for document upload
│   │   ├── dashboard/           # User query interface
│   │   └── (auth)/             # Login/signup
│   ├── components/             # React components
│   ├── lib/                    # Utilities & actions
│   └── context/                # React contexts
└── README.md
```

## API Endpoints

### `POST /api/documents/upload`
Upload a policy document (PDF or TXT).

**Form Data**:
- `file`: Document file
- `policy_area`: "IT", "HR", or "General"

### `POST /api/query`
Query the policy system.

**Request Body**:
```json
{
  "question": "What is our policy on remote work?",
  "user_id": "optional_user_id"
}
```

**Response**:
```json
{
  "answer": "Comprehensive synthesized answer...",
  "it_context": ["IT policy chunk 1", "..."],
  "hr_context": ["HR policy chunk 1", "..."],
  "sources": ["document1.pdf", "document2.txt"]
}
```

### `GET /api/documents`
List all uploaded documents.

### `DELETE /api/documents/{document_id}`
Delete a document and its chunks.

## Technologies

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Firebase
- **Backend**: FastAPI, Python
- **RAG**: ChromaDB, SentenceTransformers
- **AI**: LangChain, LangGraph, OpenAI GPT-4o
- **Document Processing**: PyMuPDF

## License

MIT
