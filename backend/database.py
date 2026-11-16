"""
database.py - SQLite Database setup using SQLAlchemy ORM
Manages: users, knowledge sources, and conversation logs
For: TMU CampusConnect (Teerthanker Mahaveer University)
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import enum

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/university_chatbot.db")

# Create the data directory if it doesn't exist
os.makedirs("./data", exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    user = "user"


class KnowledgeSourceType(str, enum.Enum):
    pdf = "pdf"
    text = "text"
    url = "url"
    manual = "manual"


# ─── Database Models ───────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=True)
    full_name = Column(String(200), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, nullable=True)  # ID of admin who created this user


class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String(20), nullable=False)  # pdf, text, url, manual
    original_path = Column(String(500), nullable=True)  # file path or URL
    chroma_ids = Column(Text, nullable=True)   # comma-separated list of chunk IDs in ChromaDB
    chunk_count = Column(Integer, default=0)
    uploaded_by = Column(Integer, nullable=False)  # User ID
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)   # soft-delete


class ConversationLog(Base):
    __tablename__ = "conversation_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=True)  # anonymous sessions for public users
    user_id = Column(Integer, nullable=True)           # null for anonymous users
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources_used = Column(Text, nullable=True)         # knowledge source names
    was_rejected = Column(Boolean, default=False)      # True if bot refused off-topic
    timestamp = Column(DateTime, default=datetime.utcnow)


class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)


# ─── Init DB ───────────────────────────────────────────────────────────────────

def init_db():
    """Create all tables and seed the initial admin user."""
    Base.metadata.create_all(bind=engine)

    # Seed default system config
    db = SessionLocal()
    try:
        defaults = {
            "system_prompt": (
                "You are the official AI Assistant for {university_name}. "
                "You ONLY answer questions about this university using the provided context. "
                "If a question is not about the university or cannot be answered from the context, "
                "reply: 'I'm sorry, I can only answer questions related to the university. "
                "Please contact the university office for other queries.' "
                "Do not use general world knowledge. Be polite, concise, and helpful."
            ),
            "university_name": os.getenv("UNIVERSITY_NAME", "Teerthanker Mahaveer University"),
            "max_context_chunks": "5",
            "similarity_threshold": "0.4",
            "web_search_enabled": "false",
        }
        for key, value in defaults.items():
            existing = db.query(SystemConfig).filter(SystemConfig.key == key).first()
            if not existing:
                db.add(SystemConfig(key=key, value=value))
        db.commit()
    finally:
        db.close()


# ─── Dependency ────────────────────────────────────────────────────────────────

def get_db():
    """FastAPI dependency that provides a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
