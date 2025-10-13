import google.genai as genai
import chromadb
import os
from pymongo import MongoClient
from typing import Optional
from dotenv import load_dotenv

# Loading DotEnv
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

def getGenAI() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    return genai.Client(api_key=api_key)

def getChroma() -> chromadb.Client:
    host: Optional[str] = os.getenv("CHROMA_HOST")
    port = os.getenv("CHROMA_PORT", 8000)

    if host:
        return chromadb.HttpClient(host=host, port=port)
    else:
        folder:str = os.getenv("CHROMA_DIR", "chroma_data")
        return chromadb.PersistentClient(path=folder)

def getMongo():
    uri = os.getenv("MONGO_URI")
    if not uri:
        raise ValueError("Mongo URI not Provided")
    return MongoClient(uri)
