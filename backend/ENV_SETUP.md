# Environment Setup Guide

## Quick Start (Local Model - No API Key Needed)

1. Create `.env` file:
```bash
LLM_PROVIDER=local
LOCAL_MODEL_NAME=google/flan-t5-base
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server - the model will download automatically on first use.

## Switching to OpenAI Later

When you get your OpenAI API key (in 2 days), simply update `.env`:

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

No code changes needed! The system automatically uses the configured provider.

## Available Local Models

- `google/flan-t5-base` (default): Small, fast, ~260MB
- `facebook/bart-large-cnn`: Better quality, slower, ~1.6GB
- `google/flan-t5-base`: Instruction-tuned, good for Q&A

Change `LOCAL_MODEL_NAME` in `.env` to switch models.

