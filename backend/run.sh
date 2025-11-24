#!/bin/bash

# Startup script for PolicyPal backend

echo "Starting PolicyPal Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "Please edit .env and add your OPENAI_API_KEY"
fi

# Create necessary directories
mkdir -p uploads
mkdir -p chroma_db

# Start server
echo "Starting FastAPI server on http://localhost:8000"
uvicorn main:app --reload --port 8000

