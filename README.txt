# 🧠 Glass-Box LangGraph Tutoring System

This is a multi-agent educational platform powered by FastAPI, LangGraph, ChromaDB, and React. It features a "Glass-Box" UI that allows users to visualize the AI's cognitive routing (Socratic Hinting vs. Direct Explanation) in real-time.

## ⚙️ Prerequisites
Before starting, ensure your `.env` file is located at `backend/.env` and contains your Gemini API key:
`GEMINI_API_KEY=your_actual_api_key_here`

---

*IMPORTANT NOTE*
run this cmd in the terminal before starting to download all dependencies

pip install fastapi uvicorn pydantic python-dotenv langgraph langchain-core langchain-google-genai chromadb

## 🚀 Standard Startup Sequence

To run this system, you need to launch the Backend (FastAPI) and the Frontend (Vite) in two separate terminal windows.

### Terminal 1: Boot the Backend (FastAPI + LangGraph)
1. Open a terminal in the root `LEARNING_COMPANION` folder.
2. Activate the Python virtual environment:
   ```bash
   .\venv\Scripts\activate


3. Start the FastAPI server:

python backend/app.py

or 

cd backend
python app.py


4. TO run the Frontend

cd Frontend
npm install("only for the first time or the first run")
npm run dev or npm run dev -- --force


5.📚 Adding New Curriculum (RAG System)[ONLY NEEDED WHEN ADDING NEW - no need to run on every startup or when data is already there in the chromadb]

If you download new textbooks from OpenStax to expand the tutor's knowledge base:

Save the extracted text as a .txt file inside backend/data/curriculum/.

Update the textbooks list at the bottom of backend/database_ingest.py.

With your virtual environment active, run the ingestion pipeline to build the new ChromaDB vectors:

Bash(IN THE TERMINAL)
'python backend/database_ingest.py'