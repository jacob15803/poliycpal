# Quick Start Guide

## Testing with Local Model (No API Key Needed)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies (this will take a few minutes)
pip install -r requirements.txt

# Create .env file
echo "LLM_PROVIDER=local" > .env
echo "LOCAL_MODEL_NAME=sshleifer/google/flan-t5-base" >> .env

# Start server
uvicorn main:app --reload --port 8000
```

**Note**: On first run, the model (~260MB) will download automatically. This may take a few minutes.

### 2. Frontend Setup

```bash
# In project root
npm install

# Create .env.local in project root (if not exists)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
# Add your Firebase config variables

# Start frontend (runs from frontend directory)
npm run dev
```

### 3. Test the System

1. **Upload Documents**: Go to `http://localhost:9002/admin`
   - Upload a PDF or TXT file
   - Select policy area (IT, HR, or General)
   - Click "Upload Document"

2. **Ask Questions**: Go to `http://localhost:9002/dashboard`
   - Ask a question like "What is our policy on remote work?"
   - The system will use the local model to generate answers

### 4. Switch to OpenAI Later

When you get your OpenAI API key:

1. Edit `backend/.env`:
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

2. Restart the backend server - that's it! No code changes needed.

## Troubleshooting

### Model Download Issues
If the model fails to download, the system will automatically fall back to template-based responses. These are functional but less sophisticated.

### Memory Issues
If you run out of memory with DistilBART, try:
- Close other applications
- Use CPU only (it will auto-detect)
- Or use an even smaller model (though quality will decrease)

### Import Errors
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

The local model setup is designed to work out of the box for testing. When you're ready for production quality, just switch the `LLM_PROVIDER` environment variable!

