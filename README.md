# 🚀 PanScience Context-Aware RAG AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

A production-ready, full-stack Retrieval-Augmented Generation (RAG) system with context-aware conversations. Upload documents (PDF/DOCX/TXT) and chat with an AI that remembers your conversation history.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)


## ✨ Features

- 📄 **Multi-Format Support**: PDF, DOCX, TXT, MD files
- 🧠 **Context-Aware AI**: Remembers last 6 conversation exchanges
- 🔍 **Vector Search**: ChromaDB-powered semantic retrieval
- 🎯 **Intelligent Chunking**: 1500-char chunks with 200-char overlap
- 📊 **Document Management**: Track indexed documents
- 🔒 **Production Ready**: Health checks, rate limiting, error handling
- 🐳 **Fully Dockerized**: One-command deployment
- 🌐 **Cloud Ready**: AWS/GCP/Azure deployment configurations

## 🏗️ Architecture             
             ┌──────────────────────────┐
             │        Frontend          │
             │  React + Tailwind (Vite) │
             └─────────────┬────────────┘
                           │
                           ▼
             ┌──────────────────────────┐
             │        FastAPI API       │
             │  (Document & Chat APIs)  │
             └─────────────┬────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │  MongoDB     │  │  ChromaDB     │  │  Gemini/OpenAI│
    │  (metadata)  │  │  (embeddings) │  │  (generation) │
    └─────────────┘  └──────────────┘  └──────────────┘




## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR Python 3.12+ & Node.js 20+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey)) Exposed in .env for your convenience

### 1️⃣ Clone Repository

```bash
git clone https://github.com/satvikmishra44/PanScienceRAG.git
cd PanScienceRAG
```

---

### 2️⃣ Build & Start Containers
```bash
docker-compose up --build
```

This launches:

| Service | Description | URL |
|----------|--------------|-----|
| 🧠 **Backend (FastAPI)** | Core API | [http://localhost:8000](http://localhost:8000) |
| 💬 **Frontend (React)** | UI Dashboard | [http://localhost:5173](http://localhost:5173) |

---

### 3️⃣ Stop Containers
```bash
docker-compose down
```

---

### 4️⃣ Verify Setup

Check API health:
```bash
curl http://localhost:8000/ping
```

Expected response:
```json
{"status": "ok", "service": "RAG-pipeline"}
```

## 🔗 API Usage Guide

### 🧩 Base URL
```
http://localhost:8000
```

---

## 📄 1. Upload Document

**Endpoint:** `/ingest`  
**Method:** `POST`

### 📝 Description
Uploads and indexes a document for retrieval and querying.

### 💡 Example (cURL)
```bash
curl -X POST "http://localhost:8000/ingest" \
  -F "file=@research_paper.pdf"
```

### ✅ Response
```json
{
  "status": "success",
  "doc_id": "66e432f78df123abc",
  "chunks": 98
}
```

---

## 🔍 2. Query Documents

**Endpoint:** `/query`  
**Method:** `POST`

### 📝 Description
Ask questions based on the indexed documents.  
Supports **chat history** for contextual and conversational responses.

### 💡 Example (JSON Body)
```json
{
  "query": "What are the applications of quantum entanglement?",
  "top_k": 4,
  "history": [
    {"role": "user", "text": "Tell me about quantum mechanics"},
    {"role": "ai", "text": "Quantum mechanics studies the behavior of matter and energy..."}
  ]
}
```

### ✅ Response
```json
{
  "status": "success",
  "answer": "Quantum entanglement enables applications in quantum computing, teleportation, and cryptography...",
  "sources": [
    {
      "text": "Quantum entanglement is a phenomenon...",
      "meta": {"source_filename": "quantum_intro.pdf"},
      "distance": 0.12
    }
  ]
}
```

---

## 📚 3. Get Document List

**Endpoint:** `/documents`  
**Method:** `GET`

### 💡 Example
```bash
curl http://localhost:8000/documents
```

---

## ❤️ 4. Health Check

**Endpoint:** `/ping`  
**Method:** `GET`

### 💡 Example
```bash
curl http://localhost:8000/ping
```

### ✅ Response
```json
{"status": "ok", "service": "RAG-pipeline"}
```

---

## Project Structure

PanScience/
│
├── backend/
│ ├── app/
│ │ ├── main.py # FastAPI entry point
│ │ ├── db.py # Database + LLM initialization
│ │ ├── rag.py # RAG ingestion and query logic
│ │ ├── utils.py # File handling and text chunking
│ ├── requirements.txt
│ ├── Dockerfile
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Chat.jsx
│ │ │ ├── DocManager.jsx
│ │ │ ├── Landing.jsx
│ ├── package.json
│ ├── Dockerfile
│
├── docker-compose.yaml
└── README.md

## 🐳 Running with Docker

### 1️⃣ Build & Start Containers
```bash
docker-compose up --build
```

This launches:

| Service | Description | URL |
|----------|--------------|-----|
| 🧠 **Backend (FastAPI)** | Core API | [http://localhost:8000](http://localhost:8000) |
| 💬 **Frontend (React)** | UI Dashboard | [http://localhost:5173](http://localhost:5173) |

### 2️⃣ Stop Containers
```bash
docker-compose down
```

---

## 🧰 Tech Stack

| Layer | Technology |
|:------|:------------|
| 🖥️ **Frontend** | React (Vite), TailwindCSS |
| ⚙️ **Backend** | FastAPI, Python |
| 🗃️ **Database** | MongoDB |
| 🧮 **Vector Store** | ChromaDB |
| 🧠 **LLM** | Gemini / OpenAI / Claude |
| 🐳 **Containerization** | Docker, Docker Compose |

---

### 🧾 Notes
- Ensure MongoDB and ChromaDB services are running before ingesting documents.  
- Large PDFs are automatically chunked for efficient retrieval.  
- API Keys Are Exposed In .env for your testing

