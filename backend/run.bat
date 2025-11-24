@echo off
REM Startup script for PolicyPal backend (Windows)

echo Starting PolicyPal Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check for .env file
if not exist ".env" (
    echo Warning: .env file not found. Copying from .env.example...
    copy .env.example .env
    echo Please edit .env and add your OPENAI_API_KEY
)

REM Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "chroma_db" mkdir chroma_db

REM Start server
echo Starting FastAPI server on http://localhost:8000
uvicorn main:app --reload --port 8000

pause

