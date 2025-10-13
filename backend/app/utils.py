import os
import uuid
import shutil
from typing import List, Tuple
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader, Docx2txtLoader, TextLoader
from langchain_core.documents import Document

def makeID()->str:
    return str(uuid.uuid4())

def saveFiles(file, directory):
    try:
        os.makedirs(directory, exist_ok=True)
        path = os.path.join(directory, makeID() + "_" + file.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        return path

    finally:
        file.file.close()

def loading(path:str, file:str) -> Tuple[List[Document], int]:
    ext = os.path.splitext(file)[1].lstrip('.').lower()
    count = 0

    # Judging Extension
    if (ext == "pdf"):
        loader = PyMuPDFLoader(path)
    elif (ext == "docx" or ext == "doc"):
        loader = Docx2txtLoader(path)
    elif (ext == "txt" or ext == "md"):
        loader = TextLoader(path, encoding="utf-8")
    else:
        loader = TextLoader(path, encoding="utf-8", autodetect_encoding=True)  # autodetect enabled for unknown embeddings or files

    documents = loader.load()

    if ext == "pdf":
        count = len(documents)

    return documents, count

def chunking(documents: List[Document]) -> List[Document]:
    # Chunking
    splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
    chunked_documents = splitter.split_documents(documents)

    return chunked_documents
