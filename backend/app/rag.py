import os
from google.genai.types import GenerateContentConfig
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.utils import saveFiles, chunking, makeID, loading
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Ingestion Pipeline
def ingest(fileObj, file, chroma, mongo, collection="documents") -> Dict[str, Any]:
    tempDir = os.getenv("UPLOAD_DIR", "/temp/uploads")
    tempPath = saveFiles(fileObj, tempDir)

    try:
        # Checking Page Count
        print(f"Loading And Validating Page Count Of [{file}")
        documents: List[Document]
        count: int

        documents, count = loading(tempPath, file)

        if count>1000:
            raise ValueError(f"Document has {count-1000} more pages than permit limit which is 1000, choose a smaller pdf")

        # Extracting And Chunking
        print(f"[{file}] - Starting text extraction and chunking...")
        chunked: List[Document] = chunking(documents)
        print(f"[{file}] - Text extraction complete. Found {len(chunked)} chunks.")

        docID = makeID()

        ef = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

        # Process Documents In ChromaDB's format
        chromaDocs = [doc.page_content for doc in chunked]
        chromaMeta = [{**doc.metadata, "source_filename": file, "doc_upload_id": docID, "chunk_index": i} for i, doc in enumerate(chunked)]
        chromaID = [makeID() for _ in chunked]

        # Adding To Chroma Collection and generating embeddings
        print(f"Generating Embeddings for file: {file}")
        embeddings = ef.embed_documents(chromaDocs)
        coll = chroma.get_or_create_collection(name=collection)
        coll.add(ids=chromaID, documents=chromaDocs, metadatas=chromaMeta, embeddings=embeddings)

        # Saving Metadata to Mongo
        docRecord = {
            "docID": docID,
            "filename": file,
            "uploaded_at": datetime.now(timezone.utc),
            "chunks_count": len(chunked),
            "collection": collection
        }

        res = mongo.rag_docs.insert_one(docRecord)
        return {"doc_id": str(res.inserted_id), "chunks": len(chunked)}

    finally:
        os.remove(tempPath)

# Query Pipeline
def queryFunc(query: str, chroma, genai, history: Optional[List[Dict[str, str]]] = None, top_k=4, collection="documents") -> Dict[str, Any]:
    coll = chroma.get_collection(name=collection)

    # Embedding Query Same As RAG
    qEmbed = genai.models.embed_content(model="models/gemini-embedding-001", contents=query)
    q_em = qEmbed.embeddings[0].values

    # Retrieving Relevant Docs To Query
    results = coll.query(query_embeddings=[q_em], n_results=top_k, include=["documents", "metadatas", "distances"])

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    # Building Prompt With Context And Query
    context = "\n\n---\n\n".join(docs)

    # Building History For Context-Awareness
    history_txt = ""
    if history:
        recent = history[-6:]
        history_txt = "\n".join([f"{item['role'].capitalize()} : {item['text']}" for item in recent])
        history_txt = f"CHAT HISTORY:\n{history_txt}\n\n"

    instruction = ("You are an assistant answering based only on the provided CONTEXT and CHAT HISTORY. If the answer is not in the context, say 'I don't know'."
        " Be concise and give exact references when quoting facts."
        " Do not use any other information. Do not mention the context.")

    prompt = f"{history_txt} CONTEXT:\n{context}\n\nQUESTION: {query}"

    # Generating Response
    config = GenerateContentConfig(max_output_tokens=256, temperature=0.0)

    response = genai.models.generate_content(model="gemini-2.0-flash", contents=[instruction, prompt], config=config)

    try:
        answer_text = response.text
    except(IndexError, AttributeError):
        answer_text = "I don't know"

    return{"answer": answer_text, "sources": [{"text": d, "meta": m, "distance": dist} for d, m, dist in zip(docs, metadatas, distances)]}