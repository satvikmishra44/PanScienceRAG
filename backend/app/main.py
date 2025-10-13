from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from app.db import getGenAI, getMongo, getChroma
from app.rag import ingest, queryFunc
from typing import Dict, Any, List, Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

'''Things Left To Implement Now:- Adding Context Awareness Upto Past 3-4 Responses(If Their Are), and Limiting Upload upto 1000 pages for a single pdf and for more than 20 documents, then have to create a docker file and run it one last time and done'''

app = FastAPI(title="RAG Server")

origins = ["http://localhost:5173"]

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def getDB():
    return getMongo().rag_db

# Context History Class
class History(BaseModel):
    role: str
    text: str

class Request(BaseModel):
    query: str
    history: Optional[List[History]] = None
    top_k: int = 4


# Ingestion Endpoint
@app.post("/ingest", response_model=Dict[str, Any])
async def ingestion(file: UploadFile = File(...), chroma=Depends(getChroma), mongo=Depends(getDB)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No Filename Provided")

    try:
        result = ingest(file, file.filename, chroma, mongo)
        return {"status": "success", **result}

    except ValueError as e:
        if "more pages than permit" in str(e):
            err = f"Upload Aborted: {e.args[0]}"
            print(err)
            raise HTTPException(status_code=413, detail=err)

    except Exception as e:
        print(f"Ingestion Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Ingestion Failed: {str(e)}")


# Query Endpoint
@app.post("/query", response_model=Dict[str, Any])
async def query(request: Request, chroma= Depends(getChroma)):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query Cannot Be Empty")

    history_data = [h.model_dump() if hasattr(h, 'model_dump') else h.dict() for h in (request.history or [])]

    try:
        result = queryFunc(request.query, chroma, genai=getGenAI(), history=history_data, top_k=request.top_k)
        return {"status":"success", **result}

    except Exception as e:
        print(f"Query Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.get("/documents", response_model=List[Dict[str, Any]])
async def list_documents(mongo=Depends(getDB)):
    # Retrieve all document records currently model is trained on
    doc_records = mongo.rag_docs.find({}, {"_id": 0, "filename":1, "uploaded_at":1, "chunks_count": 1})
    documents = []
    for doc in doc_records:
        doc["uploaded_at"] = doc["uploaded_at"].isoformat()
        documents.append(doc)

    return documents

# Ping Endpoint
@app.get("/ping")
def ping():
    return {"status": "ok", "service": "RAG-pipeline"}