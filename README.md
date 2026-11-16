# 🎓 TMU CampusConnect — AI Chatbot
### Teerthanker Mahaveer University | Intelligent Campus Assistant

A fully offline-capable AI chatbot built specifically for **Teerthanker Mahaveer University (TMU)**.
Runs on a **local Windows PC** using free, open-source AI models via [Ollama](https://ollama.com).
No cloud subscription. No monthly fees. 100% private.

---

## 📁 Project Structure

```
tmu-campusconnect/
├── backend/                       # Python FastAPI server
│   ├── main.py                    # All API endpoints
│   ├── auth.py                    # JWT + Role-based access control
│   ├── database.py                # SQLite models (users, knowledge, logs)
│   ├── rag.py                     # RAG pipeline (ChromaDB + Ollama)
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # ← Your active config (edit this!)
│   ├── .env.example               # Config template
│   ├── SETUP.bat                  # ← Run this FIRST (one time)
│   ├── START_SERVER.bat           # ← Run this every time to start
│   ├── FIX_DEPENDENCIES.bat       # Run if you have bcrypt/passlib errors
│   ├── upload_tmu_knowledge.py    # Script to pre-load TMU knowledge
│   └── upload_tmu_retry.py        # Retry script if upload fails
│
├── panel/                         # Admin Control Panel (Web UI)
│   ├── index.html                 # Main panel HTML
│   ├── style.css                  # Dark glassmorphism theme
│   └── app.js                     # Panel logic (auth, SPA routing)
│
├── widget/                        # Embeddable Chat Widget
│   ├── index.html                 # Chat window (loaded in iframe)
│   └── embed.js                   # Add to any website to embed chat
│
└── TMU_CampusConnect_Setup_Guide.md   # Complete beginner setup guide
```

---

## 🚀 Quick Start

### Prerequisites (Install Once)
1. **Python 3.12** — [python.org/downloads](https://www.python.org/downloads/release/python-3128/)
   - ⚠️ During install: **CHECK "Add Python to PATH"**
2. **Ollama for Windows** — [ollama.com/download/windows](https://ollama.com/download/windows)

### Step 1 — Download AI Models
Open **Command Prompt** (press Windows key, type `cmd`, press Enter) and run:
```
ollama pull llama3.2:3b
ollama pull mxbai-embed-large
```
> ⏱️ This takes 10–40 minutes depending on internet speed.

### Step 2 — Run Setup (One Time Only)
Go to `backend/` folder → **Double-click `SETUP.bat`**

This will:
- Create Python virtual environment
- Install all dependencies
- Create the `data/` folder and `.env` config

### Step 3 — Start TMU CampusConnect
**Double-click `START_SERVER.bat`** — keep this window open!

### Step 4 — Login to Admin Panel
Open your browser → `http://localhost:8000/panel/`
- **Username:** `admin`
- **Password:** `admin123`
- ⚠️ **Change this password immediately** after first login!

---

## 👥 User Roles

| Role | What They Can Do |
|------|-----------------|
| **Admin** | Everything: manage users, knowledge, settings, view all chat logs |
| **Teacher** | Upload & delete knowledge sources (course info, docs, etc.) |
| **Student/User** | Ask questions through the public chat widget only |

---

## 📚 Adding TMU Knowledge to the Bot

1. Login to Admin Panel → click **Knowledge Base** → **+ Add Knowledge**
2. Choose **Paste Text** or **Upload File** (PDF or TXT)

### What knowledge to add:
- Admission requirements & process
- Course catalog & program details
- Fee structure
- Scholarship information
- Hostel rules & facilities
- Campus map & description
- Faculty contacts & department details
- Academic calendar
- Placement records
- FAQs

---

## 🌐 Accessing from Anywhere (Internet)

TMU CampusConnect supports **free internet access** via ngrok:

| URL | Purpose |
|-----|---------|
| `https://unstuffed-flyover-answering.ngrok-free.dev/panel/` | Admin Panel (from internet) |
| `https://unstuffed-flyover-answering.ngrok-free.dev/widget/` | Chat Widget (from internet) |

> This permanent free URL means students, teachers, and parents can access the chatbot
> from their phones or laptops without being on the same WiFi.

---

## 🌐 Embedding the Chatbot on TMU Website

Add this **one line** to any TMU web page (just before `</body>`):

```html
<script src="https://unstuffed-flyover-answering.ngrok-free.dev/widget/embed.js"></script>
```

A floating 🎓 chat button will appear on every page automatically.

---

## 🔄 Running 24/7 on Windows

To keep the server running even after reboot:
1. Download **NSSM** (Non-Sucking Service Manager): [nssm.cc](https://nssm.cc)
2. Open PowerShell as Administrator:
```powershell
nssm install TMUCampusConnect "C:\Users\Aashutosh Singh Rawa\.gemini\antigravity\scratch\tmu-campusconnect\backend\venv\Scripts\uvicorn.exe" "main:app --host 0.0.0.0 --port 8000"
nssm set TMUCampusConnect AppDirectory "C:\Users\Aashutosh Singh Rawa\.gemini\antigravity\scratch\tmu-campusconnect\backend"
nssm start TMUCampusConnect
```

---

## 🔒 Security Checklist

- [ ] Change admin password after first login (Settings → Change My Password)
- [ ] Set a strong `SECRET_KEY` in `backend/.env`
- [ ] Add teachers as "Teacher" role accounts, not "Admin"
- [ ] Review chat logs regularly (Admin Panel → Chat Logs)

---

## 🧩 Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| LLM Engine | Ollama + Llama 3.2 3B | Free, local, offline |
| Embeddings | mxbai-embed-large | High quality semantic search |
| Vector DB | ChromaDB | Simple, file-based, no server needed |
| Backend | FastAPI (Python) | Fast, modern, auto API docs |
| Auth | JWT + bcrypt | Secure, stateless |
| Database | SQLite | Zero config, single file |
| Frontend | Pure HTML/CSS/JS | No build step, works everywhere |

---

## 📞 TMU Contact Info (Pre-loaded in Bot Responses)

- **Toll-Free:** 1800-270-1490
- **Website:** www.tmu.ac.in
- **Email:** admissions@tmu.ac.in

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| SETUP.bat fails with Python error | Make sure Python 3.12 is installed AND "Add to PATH" was checked |
| `bcrypt` error on startup | Run `FIX_DEPENDENCIES.bat` |
| Chat says "could not reach server" | Make sure `START_SERVER.bat` is running and Ollama is open |
| Bot doesn't know TMU info | Upload knowledge via Admin Panel → Knowledge Base |
| Forgot admin password | Delete `backend/data/tmu_campusconnect.db` and re-run SETUP.bat (resets everything) |
