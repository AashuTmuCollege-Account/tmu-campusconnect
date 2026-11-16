"""
main.py - TMU CampusConnect AI Chatbot Backend
FastAPI application for Teerthanker Mahaveer University with:
  - /api/auth       - Login, register (admin-only)
  - /api/chat       - Public chatbot endpoint
  - /api/knowledge  - Upload/manage university knowledge (teacher+)
  - /api/admin      - User & system config management (admin only)
"""

import os
import uuid
import io
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import (
    init_db, get_db, User, UserRole, KnowledgeSource,
    ConversationLog, SystemConfig
)
from auth import (
    hash_password, authenticate_user, create_access_token,
    get_current_user, require_admin, require_teacher_or_above, Token
)
from rag import ingest_text, retrieve_context, generate_answer, delete_source_chunks

load_dotenv()

# ─── App Setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="TMU CampusConnect API",
    description="TMU CampusConnect - AI Assistant for Teerthanker Mahaveer University",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the admin panel static files
PANEL_DIR = os.path.join(os.path.dirname(__file__), "..", "panel")
if os.path.exists(PANEL_DIR):
    app.mount("/panel", StaticFiles(directory=PANEL_DIR, html=True), name="panel")

# Serve the chat widget
WIDGET_DIR = os.path.join(os.path.dirname(__file__), "..", "widget")
if os.path.exists(WIDGET_DIR):
    app.mount("/widget", StaticFiles(directory=WIDGET_DIR, html=True), name="widget")


@app.get("/", include_in_schema=False)
def root():
    """Redirect root domain visits to the TMU Chatbot Widget."""
    return RedirectResponse(url="/widget/")


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    fav = os.path.join(PANEL_DIR, "favicon.ico")
    if os.path.exists(fav):
        return FileResponse(fav)
    return Response(status_code=204)


@app.on_event("startup")
def on_startup():
    init_db()
    seed_admin_user()


def seed_admin_user():
    """Create a default admin user on first run if none exists."""
    db = next(get_db())
    try:
        admin = db.query(User).filter(User.role == UserRole.admin).first()
        if not admin:
            default_admin = User(
                username="admin",
                email="admin@university.edu",
                full_name="System Administrator",
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
            )
            db.add(default_admin)
            db.commit()
            print("✅ Default admin created: username=admin, password=admin123")
            print("⚠️  IMPORTANT: Change the admin password immediately after first login!")
    finally:
        db.close()


# ─── Pydantic Request / Response Models ────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
    session_id: str
    rejected: bool = False


class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: str
    role: UserRole = UserRole.user


class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class KnowledgeOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    source_type: str
    chunk_count: int
    uploaded_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class SystemConfigUpdate(BaseModel):
    key: str
    value: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ─── Auth Endpoints ────────────────────────────────────────────────────────────

@app.post("/api/auth/login", response_model=Token, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_access_token({"sub": user.username, "role": user.role})
    return Token(access_token=token, token_type="bearer", role=user.role, username=user.username)


@app.post("/api/auth/register", response_model=UserOut, tags=["Auth"])
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin-only: Create a new user (any role)."""
    existing = db.query(User).filter(User.username == user_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        created_by=admin.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/auth/change-password", tags=["Auth"])
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from auth import verify_password
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


# ─── Chat Endpoint (Public) ────────────────────────────────────────────────────

@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Public chat endpoint. No authentication required."""
    session_id = request.session_id or str(uuid.uuid4())
    question = request.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Get system config
        def get_config(key, default=""):
            cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
            return cfg.value if cfg else default

        system_prompt   = get_config("system_prompt")
        university_name = get_config("university_name", "Teerthanker Mahaveer University (TMU)")

        # RAG: retrieve relevant context from ChromaDB
        context_chunks = retrieve_context(question)

        # Generate answer via Ollama
        result = generate_answer(question, context_chunks, system_prompt, university_name)

    except Exception as e:
        print(f"[Chat] Unexpected error: {e}")
        result = {
            "answer": (
                "I'm sorry, I'm having trouble right now. Please try again in a moment.\n\n"
                "You can also contact us directly:\n"
                "📞 Toll-Free: 1800-270-1490\n"
                "🌐 Website: www.tmu.ac.in"
            ),
            "sources": [],
            "rejected": False
        }

    # Log the conversation (best-effort — don't crash if logging fails)
    try:
        log = ConversationLog(
            session_id=session_id,
            question=question,
            answer=result["answer"],
            sources_used=", ".join(result["sources"]),
            was_rejected=result["rejected"]
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"[Chat] Logging error (non-fatal): {e}")

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        session_id=session_id,
        rejected=result["rejected"]
    )



# ─── Knowledge Management (Teacher+) ──────────────────────────────────────────

@app.get("/api/knowledge", response_model=List[KnowledgeOut], tags=["Knowledge"])
def list_knowledge(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_above)
):
    sources = db.query(KnowledgeSource).filter(KnowledgeSource.is_active == True).all()
    return sources


@app.post("/api/knowledge/upload-text", response_model=KnowledgeOut, tags=["Knowledge"])
def upload_text_knowledge(
    name: str = Form(...),
    description: str = Form(""),
    content: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_above)
):
    """Upload raw text as a knowledge source."""
    chunk_ids = ingest_text(content, source_name=name, source_id=0)
    source = KnowledgeSource(
        name=name,
        description=description,
        source_type="manual",
        chroma_ids=",".join(chunk_ids),
        chunk_count=len(chunk_ids),
        uploaded_by=current_user.id
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    # Update chroma IDs with real source_id
    ingest_text(content, source_name=name, source_id=source.id)
    return source


@app.post("/api/knowledge/upload-file", response_model=KnowledgeOut, tags=["Knowledge"])
async def upload_file_knowledge(
    name: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_above)
):
    """Upload a PDF or TXT file as a knowledge source."""
    content_bytes = await file.read()

    if file.filename.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            content = "\n\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")
    elif file.filename.endswith(".txt"):
        content = content_bytes.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="Only .pdf and .txt files are supported")

    if not content.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the file")

    chunk_ids = ingest_text(content, source_name=name, source_id=0)
    source = KnowledgeSource(
        name=name,
        description=description,
        source_type="pdf" if file.filename.endswith(".pdf") else "text",
        original_path=file.filename,
        chroma_ids=",".join(chunk_ids),
        chunk_count=len(chunk_ids),
        uploaded_by=current_user.id
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@app.delete("/api/knowledge/{source_id}", tags=["Knowledge"])
def delete_knowledge(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_or_above)
):
    """Soft-delete a knowledge source and remove its chunks from ChromaDB."""
    source = db.query(KnowledgeSource).filter(KnowledgeSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Knowledge source not found")

    # Remove from ChromaDB
    if source.chroma_ids:
        ids = [i.strip() for i in source.chroma_ids.split(",") if i.strip()]
        delete_source_chunks(ids)

    source.is_active = False
    db.commit()
    return {"message": f"Knowledge source '{source.name}' deleted successfully"}


# ─── Admin Endpoints ───────────────────────────────────────────────────────────

@app.get("/api/admin/users", response_model=List[UserOut], tags=["Admin"])
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(User).all()


@app.delete("/api/admin/users/{user_id}", tags=["Admin"])
def deactivate_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user.is_active = False
    db.commit()
    return {"message": f"User '{user.username}' deactivated"}


@app.get("/api/admin/config", tags=["Admin"])
def get_config(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    configs = db.query(SystemConfig).all()
    return {c.key: c.value for c in configs}


@app.put("/api/admin/config", tags=["Admin"])
def update_config(
    update: SystemConfigUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    cfg = db.query(SystemConfig).filter(SystemConfig.key == update.key).first()
    if cfg:
        cfg.value = update.value
        cfg.updated_by = admin.id
        cfg.updated_at = datetime.utcnow()
    else:
        cfg = SystemConfig(key=update.key, value=update.value, updated_by=admin.id)
        db.add(cfg)
    db.commit()
    return {"message": f"Config '{update.key}' updated"}


@app.get("/api/admin/logs", tags=["Admin"])
def get_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    logs = db.query(ConversationLog).order_by(ConversationLog.timestamp.desc()).limit(limit).all()
    return logs


@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "online", "service": "TMU CampusConnect API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
