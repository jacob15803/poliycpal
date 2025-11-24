# Project Structure

The project is organized with clear separation between backend and frontend:

```
poliycpal/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── services/           # Backend services
│   │   ├── document_processor.py
│   │   ├── rag_service.py
│   │   ├── agentic_debate.py
│   │   └── llm_service.py
│   ├── requirements.txt    # Python dependencies
│   └── README.md
│
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app directory
│   │   ├── (auth)/         # Authentication routes
│   │   ├── admin/          # Admin panel
│   │   ├── dashboard/      # User dashboard
│   │   └── history/        # Query history
│   ├── components/         # React components
│   ├── lib/                # Utilities and actions
│   ├── context/            # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── next.config.ts      # Next.js configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── tailwind.config.ts  # Tailwind CSS configuration
│
├── package.json           # Node.js dependencies (root level)
├── README.md               # Main documentation
└── docs/                   # Additional documentation
```

## Running the Project

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
# From project root
npm install
npm run dev  # Automatically runs from frontend directory
```

The npm scripts are configured to run from the `frontend` directory automatically.

