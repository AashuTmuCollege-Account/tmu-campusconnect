"""
rag.py - Retrieval-Augmented Generation pipeline
Uses: ChromaDB (local vector store) + Ollama (local embeddings + LLM)
Handles: document ingestion, embedding, retrieval, guardrail filtering, answer generation
For: TMU CampusConnect - Teerthanker Mahaveer University
"""

import os
import uuid
import httpx
import chromadb

from typing import List, Dict, Any, Optional
from chromadb import EmbeddingFunction, Documents, Embeddings
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL    = os.getenv("OLLAMA_BASE_URL",    "http://localhost:11434")
OLLAMA_CHAT_MODEL  = os.getenv("OLLAMA_CHAT_MODEL",  "llama3:8b")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "mxbai-embed-large")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chromadb")
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "1.5"))
MAX_CONTEXT_CHUNKS   = int(os.getenv("MAX_CONTEXT_CHUNKS", "3"))

# Timeouts — keep tight so the widget never shows a blank screen
EMBED_TIMEOUT = 60.0    # seconds to wait for embedding
LLM_TIMEOUT   = 90.0    # seconds to wait for LLM answer

# Ensure data directories exist
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

DEFAULT_SYSTEM_PROMPT = (
    "You are CampusConnect, the official AI assistant for {university_name}. "
    "Your job is to answer questions from students, parents, and visitors "
    "about the university — including admissions, courses, fees, scholarships, "
    "hostel, campus, placements, contacts, and other university-related topics. "
    "Answer ONLY based on the provided context. "
    "If the answer is not in the context, say you don't have that information "
    "and suggest the student contact the university directly at 1800-270-1490 "
    "or visit www.tmu.ac.in. "
    "Be friendly, concise, and helpful. "
    "Never make up information. "
    "Do NOT answer questions unrelated to {university_name}."
)


# ─── ChromaDB Setup ────────────────────────────────────────────────────────────

class OllamaEmbeddingFunction(EmbeddingFunction):
    """Custom embedding function that calls Ollama's local embedding model."""

    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        for text in input:
            try:
                response = httpx.post(
                    f"{OLLAMA_BASE_URL}/api/embeddings",
                    json={"model": OLLAMA_EMBED_MODEL, "prompt": text},
                    timeout=EMBED_TIMEOUT
                )
                response.raise_for_status()
                embeddings.append(response.json()["embedding"])
            except httpx.TimeoutException:
                raise RuntimeError(
                    f"Ollama embedding timed out after {EMBED_TIMEOUT}s. "
                    "Make sure Ollama is running and the model is loaded."
                )
            except Exception as e:
                raise RuntimeError(f"Embedding error: {e}")
        return embeddings


def get_chroma_collection():
    """Get or create the ChromaDB collection for university knowledge."""
    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    collection = client.get_or_create_collection(
        name="university_knowledge",
        embedding_function=OllamaEmbeddingFunction(),
        metadata={"hnsw:space": "cosine"}
    )
    return collection


# ─── Document Ingestion ────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = 250, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks for better retrieval."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        start += chunk_size - overlap
        if start >= len(words):
            break
    return chunks


def ingest_text(
    text: str,
    source_name: str,
    source_id: int,
    metadata: Optional[Dict[str, Any]] = None
) -> List[str]:
    """
    Ingests raw text into ChromaDB.
    Returns list of chunk IDs created.
    """
    collection = get_chroma_collection()
    chunks = chunk_text(text)
    if not chunks:
        return []

    chunk_ids = [str(uuid.uuid4()) for _ in chunks]
    base_metadata = {
        "source_name": source_name,
        "source_id": str(source_id),
    }
    if metadata:
        base_metadata.update(metadata)

    metadatas = [base_metadata.copy() for _ in chunks]

    collection.add(
        documents=chunks,
        ids=chunk_ids,
        metadatas=metadatas
    )
    return chunk_ids


def delete_source_chunks(chunk_ids: List[str]):
    """Remove specific chunks from ChromaDB by their IDs."""
    if not chunk_ids:
        return
    try:
        collection = get_chroma_collection()
        collection.delete(ids=chunk_ids)
    except Exception:
        pass


# ─── RAG Query ─────────────────────────────────────────────────────────────────

def retrieve_context(query: str, n_results: int = MAX_CONTEXT_CHUNKS) -> List[Dict]:
    """
    Query ChromaDB for the most relevant university knowledge chunks.
    Returns list of {text, source_name, distance} dicts.
    """
    try:
        collection = get_chroma_collection()
        count = collection.count()
        if count == 0:
            return []

        results = collection.query(
            query_texts=[query],
            n_results=min(n_results, count),
            include=["documents", "metadatas", "distances"]
        )

        chunks = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            # cosine distance: 0 = identical. Lower = more similar.
            if dist < SIMILARITY_THRESHOLD:
                chunks.append({
                    "text": doc,
                    "source_name": meta.get("source_name", "University Knowledge"),
                    "distance": dist
                })
        return chunks
    except Exception as e:
        print(f"[RAG] Context retrieval error: {e}")
        return []


# ─── LLM Inference ─────────────────────────────────────────────────────────────

def generate_answer(
    question: str,
    context_chunks: List[Dict],
    system_prompt: str,
    university_name: str
) -> Dict[str, Any]:
    """
    Send question + retrieved context to the local Ollama LLM.
    Returns the generated answer and list of sources used.
    Falls back to a helpful message if Ollama is unavailable.
    """

    # Use default system prompt if none is configured
    if not system_prompt or not system_prompt.strip():
        system_prompt = DEFAULT_SYSTEM_PROMPT

    # Replace placeholder
    formatted_system = system_prompt.replace("{university_name}", university_name)

    # If no context found, return a helpful no-info message
    if not context_chunks:
        return {
            "answer": (
                f"I'm sorry, I don't have specific information about that in the "
                f"{university_name} knowledge base. "
                f"For accurate details, please contact the university directly:\n\n"
                f"📞 Toll-Free: 1800-270-1490\n"
                f"📧 Email: admissions@tmu.ac.in\n"
                f"🌐 Website: www.tmu.ac.in"
            ),
            "sources": [],
            "rejected": True
        }

    # Build compact context (truncate each chunk to 300 chars for speed)
    context_parts = []
    for c in context_chunks[:3]:
        chunk_text_trimmed = c['text'][:500]  # hard cap per chunk
        context_parts.append(f"{c['source_name']}: {chunk_text_trimmed}")
    context_text = "\n---\n".join(context_parts)
    sources = list({c["source_name"] for c in context_chunks})

    prompt = (
        f"University info:\n{context_text}\n\n"
        f"Question: {question}\n"
        f"Answer briefly and helpfully (2-4 sentences max):"
    )

    try:
        response = httpx.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_CHAT_MODEL,
                "system": formatted_system,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 150,
                    "num_ctx": 2048
                }
            },
            timeout=LLM_TIMEOUT
        )
        response.raise_for_status()
        answer = response.json().get("response", "").strip()

        if not answer:
            answer = (
                f"I found some information but could not generate a response. "
                f"Please contact {university_name} at 1800-270-1490 for assistance."
            )

        return {"answer": answer, "sources": sources, "rejected": False}

    except httpx.TimeoutException:
        # Ollama took too long — return the raw context as the answer
        summary = "\n".join([f"• {c['text'][:200]}..." for c in context_chunks[:2]])
        return {
            "answer": (
                f"The AI model is taking longer than expected to respond. "
                f"Here is what I found in the knowledge base:\n\n{summary}\n\n"
                f"For complete information, contact: 📞 1800-270-1490 | 🌐 www.tmu.ac.in"
            ),
            "sources": sources,
            "rejected": False
        }

    except Exception as e:
        print(f"[RAG] LLM error: {e}")
        return {
            "answer": (
                f"I'm having trouble connecting to the AI model right now. "
                f"Please try again in a moment or contact {university_name} directly:\n"
                f"📞 1800-270-1490 | 🌐 www.tmu.ac.in"
            ),
            "sources": [],
            "rejected": False
        }
