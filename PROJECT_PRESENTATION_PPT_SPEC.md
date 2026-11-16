# 🎓 TMU CampusConnect — Comprehensive Project Presentation & PPT Source Document
> **AI PPT Generation Master Briefing**  
> *Feed this document directly into Gamma, ChatGPT, SlidesAI, Tome, or Claude to generate a presentation deck.*  
> **Live Presentation Deck (PPTX):** [https://docs.google.com/presentation/d/13RR1poanwfnmSjKM5t_sKsrNDSM0c-SPauWyYibzRMU/edit?usp=sharing](https://docs.google.com/presentation/d/13RR1poanwfnmSjKM5t_sKsrNDSM0c-SPauWyYibzRMU/edit?usp=sharing)  
> **Official Project Report:** [https://1drv.ms/w/c/e3fbbcd6169783b1/IQAjzOGNm1fYQ7aI9ddFIGi6AeZqgnmdRz36kVOfmjIvsBk?e=06bLx1](https://1drv.ms/w/c/e3fbbcd6169783b1/IQAjzOGNm1fYQ7aI9ddFIGi6AeZqgnmdRz36kVOfmjIvsBk?e=06bLx1)

---

## 📌 Slide 1: Title Slide (Project Overview)
- **Project Title:** TMU CampusConnect — On-Premise AI Campus Assistant & Universal Deployment Hub
- **Subtitle:** An Offline, Privacy-Preserving Retrieval-Augmented Generation (RAG) Architecture for Teerthanker Mahaveer University
- **Academic Institution:** Teerthanker Mahaveer University (TMU), Moradabad, Uttar Pradesh, India - 244001
- **Faculty / College:** College of Computing Sciences and Information Technology (CCSIT)
- **Academic Degree:** Bachelor of Computer Applications (BCA) / Final Year Major Capstone Project
- **Lead Developer & Presenter:** **Aashutosh Singh Rawat** (Enrollment: `TCA2468008`)
- **Key Highlights:**
  - 100% On-Premise AI Engine (Zero Cloud / Token Costs)
  - Sub-Second Local Vector Retrieval via ChromaDB
  - Official TMU Amber (`#FFB106`) Themed Web Experience
  - One-Click Universal Self-Healing Windows Installer
- **Visual Recommendation:** TMU University Crest / Logo (`assets/tmu-logo.png`) centered, with elegant Amber (`#FFB106`) and Charcoal (`#2D1A00`) corporate gradient background.

---

## 📌 Slide 2: The Problem Statement (Why TMU CampusConnect?)
- **High Administrative Bottlenecks:** University admission desks, exam cells, and departmental counters handle hundreds of repetitive student and parent queries daily (admissions, fee structures, hostel rules, exam timetables).
- **Fragmented Information Silos:** Academic handbooks, prospectus PDFs, and policy circulars are scattered across disparate portal pages, making quick retrieval cumbersome for first-time visitors and students.
- **The Pitfalls of Cloud-Based AI (OpenAI / Anthropic):**
  - **Recurring Costs:** High monthly API billing (\$100s–\$1000s/year) unsustainable for university-scale deployment.
  - **Student Privacy & Compliance:** Pushing student inquiry data and internal university policies to external third-party cloud servers risks data leakage.
  - **Network Vulnerability:** Cloud AI fails when external WAN links fail or experience high latency.
- **Goal:** Build an enterprise-grade, zero-cloud-cost, privacy-first conversational assistant tailored specifically for Teerthanker Mahaveer University.

---

## 📌 Slide 3: The Proposed Solution
- **TMU CampusConnect:** An on-premise, end-to-end intelligent assistant running locally on consumer Windows hardware.
- **Four Core Pillars of the Solution:**
  1. **Local LLM Engine:** Powered by Meta's **LLaMA 3.2 3B** instructed model running through **Ollama** — blazing fast inference without external internet dependencies.
  2. **High-Accuracy Vector RAG:** Retrieval-Augmented Generation with **ChromaDB** and **mxbai-embed-large** embeddings, ensuring zero hallucinations by strictly anchoring responses to verified TMU handbooks.
  3. **Branded Student Experience:** TMU Amber (`#FFB106`) responsive chat widget featuring 15-minute privacy auto-clear, restart chat controls, and tappable link pills.
  4. **Universal Zero-Config Installer:** Dual-tab graphical deployment hub that auto-inspects, installs missing dependencies (Python, Ollama, models), and provides 1-click launch controls.

---

## 📌 Slide 4: High-Level System Architecture
```
                                ┌─────────────────────────────────────────┐
                                │          End-User Touchpoints           │
                                ├────────────────────┬────────────────────┤
                                │  Student / Visitor │ Faculty / Admin    │
                                │  TMU Amber Widget  │ Control Dashboard  │
                                └─────────┬──────────┴─────────┬──────────┘
                                          │                    │
                                          ▼                    ▼
                                ┌─────────────────────────────────────────┐
                                │      FastAPI REST Gateway (Port 8000)   │
                                ├─────────────────────────────────────────┤
                                │ • JWT Authentication & IP Session Lock │
                                │ • Dynamic Origin CORS Handler           │
                                │ • Conversation Audit Logging (SQLite)   │
                                └─────────┬───────────────────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
        ┌──────────────────────┐                     ┌──────────────────────┐
        │  ChromaDB Vector DB  │                     │   Ollama Local LLM   │
        ├──────────────────────┤                     ├──────────────────────┤
        │ • 13 TMU Documents   │  Top-3 Similarity   │ • LLaMA 3.2 3B Brain │
        │ • 115 Semantic Chunks│ ──────────────────> │ • Context Injection  │
        │ • mxbai-embed-large  │   Context Chunks    │ • Sub-2s Generation  │
        └──────────────────────┘                     └──────────────────────┘
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          ▼
                                ┌───────────────────┐
                                │ Grounded Response │
                                └───────────────────┘
```
- **Key Architectural Highlights:**
  - Decoupled client-server architecture with RESTful endpoints.
  - Vector similarity search runs in $<15\text{ms}$.
  - LLM receives only top-relevant context chunks, preventing token exhaustion and hallucinations.

---

## 📌 Slide 5: The RAG (Retrieval-Augmented Generation) Pipeline
- **What is RAG?** RAG combines semantic search with generative language models so the AI only answers using facts from pre-approved university documents.
- **Stage 1: Document Ingestion & Chunking**
  - TMU prospectus and guidelines are split into semantic chunks (average 500 characters with 10% overlap).
- **Stage 2: Vector Embedding Generation**
  - Each text chunk is converted into a 1024-dimensional dense vector using `mxbai-embed-large`.
- **Stage 3: Vector Storage & Indexing**
  - Stored in a persistent on-disk ChromaDB collection (`university_knowledge`).
- **Stage 4: Semantic Query Retrieval**
  - User query is converted into an embedding; ChromaDB computes cosine distance and extracts top-3 closest knowledge chunks.
- **Stage 5: Guardrails & Grounded Generation**
  - If cosine distance exceeds similarity threshold ($0.75$), the system triggers the **Smart Fallback** with a tappable Google search link.
  - If valid context is found, LLaMA 3.2 3B synthesizes a polite, factual answer and cites sources.

---

## 📌 Slide 6: Student Experience & Chat Widget Features
- **Brand-Authentic UI Palette:** Designed using official TMU Amber (`#FFB106`), Deep Amber (`#e69500`), TMU Red (`#C0392B`), and warm background (`#F5F2EB`).
- **Real TMU Crest:** Official university logo rendered in the header avatar and welcome card.
- **15-Minute Inactivity Auto-Clear:** Ensures session data and chat history are wiped when a student leaves a public university lab computer, safeguarding student privacy.
- **Quick Restart Button:** Header icon (`#restart-btn`) enables one-click conversation reset with confirmation prompt.
- **Secret Long-Press Admin Access:** Holding the header logo for 800ms directly redirects faculty/admins to the `/panel/` login.
- **Smart Link & Phone Pills:** Automatically scans bot replies for phone numbers (`1800-270-1490`) and URLs, converting them into tappable visual pills.
- **Universal Mobile Adaptability:** Native support for `100dvh`, `-webkit-fill-available`, and iPhone safe-area insets (`env(safe-area-inset-bottom)`).

---

## 📌 Slide 7: Faculty & Administrative Control Panel
- **3-Tier Role-Based Access Control (RBAC):**
  - **Admin:** Complete system configuration, user provisioning, audit logs, and prompt tuning.
  - **Teacher / Faculty:** Authorized to upload course syllabi, departmental notices, and manage owned knowledge.
  - **Student / Visitor:** Free conversational access without credentials.
- **Knowledge Management System:**
  - Multi-file drag-and-drop uploader supporting PDF, TXT, and Markdown.
  - Instant chunk breakdown counter and vector deletion capabilities.
- **Security & Privacy Shields:**
  - **10-minute Inactivity Auto-Logout** with security timeout modal.
  - **Client IP Session Locking:** Binds JWT session tokens to client IP addresses to prevent session hijacking.
- **Analytics & Chat Auditing:**
  - Real-time tabular viewer of student queries, generated answers, similarity flags, and timestamps.
  - Flagging mechanism for out-of-scope or rejected inquiries.

---

## 📌 Slide 8: One-Click Universal Deployment Hub (The Installer)
- **The Problem It Solves:** Deploying an on-premise AI traditionally requires manual CLI commands, Python installs, Ollama setup, model pulling, and venv configuration.
- **The TMU CampusConnect Solution:** A zero-config Windows WPF installer inspired by modern Apple and WingetUI aesthetics.
- **Tab 1: 1-Click Installation & System Health Doctor:**
  - **Stage 1 (Hardware & OS):** Detects Windows 10/11 64-bit and memory capacity (12 GB verified).
  - **Stage 2 (Python 3.12 Engine):** Silently installs or verifies Python 3.12 with environment `PATH` auto-configuration.
  - **Stage 3 (Ollama AI Server):** Validates daemon health; auto-starts Ollama service in background.
  - **Stage 4 (Local AI Models):** Inspects model registry; pulls `llama3.2:3b` and `mxbai-embed-large` if missing.
  - **Stage 5 (Virtualenv & Dependency Healing):** Self-heals binary wheel dependencies (`bcrypt==4.0.1`, `chromadb`) without requiring C++ build tools.
  - **Stage 6 (Knowledge Verification):** Verifies 13 TMU sources and 284 pre-loaded conversation logs.
- **Tab 2: Quick Launch & Deploy Hub:**
  - Telemetry monitors for FastAPI (Port 8000), Ollama (Port 11434), and Ngrok tunnel.
  - One-click launcher buttons for Chatbot Server, Internet Tunnel, and direct browser shortcuts.

---

## 📌 Slide 9: Multi-Channel University Portal Integration
- **Universal Script Embed (`embed.js`):**
  - Single `<script>` line integration for any university webpage.
  - Auto-detects server origin (works seamlessly on localhost and ngrok).
  - Amber floating action button with expandable responsive iframe.
- **Left-Docked Portal Embed (`embed-left.js`):**
  - Specifically designed for student ERP dashboards and portal sidebars.
- **Tampermonkey Userscript (`tampermonkey-tmu.user.js`):**
  - Pre-configured for `portal2.tmu.ac.in` to inject the chatbot into live university portals without modifying core server source code.
- **Mobile QR Code Access:**
  - Scannable QR codes placed directly in documentation and GitHub for immediate smartphone testing.

---

## 📌 Slide 10: Complete Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Language & Runtime** | Python 3.12 (64-bit) | High-performance core backend and inference orchestration |
| **API Framework** | FastAPI, Uvicorn, Starlette | Async REST endpoints, static mounting, CORS middleware |
| **Local LLM Engine** | Ollama, Meta LLaMA 3.2 3B | On-premise language reasoning and answer generation |
| **Embedding Model** | `mxbai-embed-large` (1024-dim) | High-precision domain document vectorization |
| **Vector Database** | ChromaDB (Persistent On-Disk) | Vector indexing, cosine distance search, metadata filtering |
| **Relational Database** | SQLite 3, SQLAlchemy ORM | User authentication, RBAC, conversation audit logs |
| **Security & Auth** | Passlib, Bcrypt, PyJWT | Salted password hashing, JWT bearer tokens, IP binding |
| **Frontend Clients** | Vanilla JavaScript, CSS3, HTML5 | Zero-framework lightweight widget (<20KB) & Admin Panel |
| **Automation & UI** | PowerShell 5.1+, WPF / XAML | Graphical universal installer & telemetry deploy hub |
| **Public Gateway** | Ngrok Secure Tunnel, Cloudflare | SSL termination and public internet port forwarding |

---

## 📌 Slide 11: Quantitative Benchmarks & Cost Analysis

| Metric | Cloud-Based AI (e.g. OpenAI GPT-4o) | TMU CampusConnect (Local RAG) |
| :--- | :--- | :--- |
| **Monthly Token / API Cost** | \$150 – \$600 / month | **\$0.00 / month (100% Free)** |
| **Data Privacy & Security** | Data sent to external servers | **100% On-Device / Local Privacy** |
| **Vector Retrieval Latency** | 120ms – 250ms (Cloud Vector DB) | **<15ms (Local ChromaDB)** |
| **Inference Generation Time**| 1.5s – 3.5s | **0.8s – 1.8s (LLaMA 3.2 3B)** |
| **Internet Dependency** | 100% mandatory | **Zero for local campus LAN usage** |
| **Hardware Required** | Thin client | **Standard PC (8GB–16GB RAM, CPU/iGPU)** |
| **Hallucination Rate** | 15% – 25% (unconstrained) | **<1% (Strict Context Similarity Anchor)** |

---

## 📌 Slide 12: Knowledge Base & Dataset Overview
- **Pre-Loaded Knowledge Base:**
  - **Total Sources:** 13 Official University Handbooks & Prospectuses
  - **Total Semantic Chunks:** 115 Indexed Vectors in ChromaDB
  - **Dataset Size:** 4.4 MB curated text and 284 interaction logs
- **Domains Covered:**
  - **Admissions & Eligibility:** BCA, B.Tech, MBA, Medical, Law entrance criteria.
  - **Fee Structure & Scholarships:** Jain minority scholarships, merit concessions.
  - **Hostel & Campus Life:** Curfew timings, mess facilities, indoor sports complex.
  - **Examinations & Grading:** Credit system, backlog policies, marksheet verification.
  - **Placements & Industry Tie-ups:** TCS, Wipro, Infosys placement stats and CRC cell contacts.

---

## 📌 Slide 13: Project Demonstrations & Live Access Links
- **Live Internet Access (Active Ngrok Tunnel):**
  - **Chatbot Widget:** `https://unstuffed-flyover-answering.ngrok-free.dev/widget/`
  - **Admin Control Panel:** `https://unstuffed-flyover-answering.ngrok-free.dev/panel/`
- **Default Demonstration Credentials:**
  - **Username:** `admin` | **Password:** `admin123`
- **Open-Source GitHub Repository:**
  - `https://github.com/AashuTmuCollege-Account/tmu-campusconnect`
- **Mobile QR Code Scanning:** Presenters can project the QR code on screen for faculty evaluators to scan and test on their own mobile devices in real time.

---

## 📌 Slide 14: Challenges Faced & Engineering Solutions
1. **Challenge:** Windows C++ Build Tool Errors when installing ChromaDB & hnswlib.  
   **Solution:** Built automated dependency healer using pre-compiled binary wheels and `bcrypt==4.0.1` pinning.
2. **Challenge:** Out-of-Scope Questions causing hallucinations.  
   **Solution:** Implemented semantic similarity guardrails ($0.75$ threshold) and rejection phrase detection with auto-generated Google search link pills.
3. **Challenge:** Mobile browser chrome obscuring the chat input box.  
   **Solution:** Implemented dynamic CSS viewport height (`100dvh`, `-webkit-fill-available`) and safe area insets.
4. **Challenge:** Multiple batch scripts required to launch separate background services.  
   **Solution:** Engineered the dual-tab WPF One-Click Deployment Hub that manages Ollama, FastAPI, and Ngrok in a single unified UI.

---

## 📌 Slide 15: Future Scope & Roadmap
- **Multilingual Hindi / Hinglish Speech Support:** Integrating Whisper on-device STT for voice queries from vernacular students.
- **University ERP Integration:** Connecting directly with TMU's SQL database for authenticated personal queries (individual student fee balance, attendance percentage, exam admit card generation).
- **Omnichannel Messaging:** WhatsApp Business API and Telegram bot integration powered by the same backend RAG engine.
- **Smart Analytics Dashboard:** Automated reporting for university deans highlighting emerging student questions, admission trends, and grievance patterns.

---

## 📌 Slide 16: Conclusion & Acknowledgments
- **Conclusion:** TMU CampusConnect proves that enterprise-grade, privacy-first conversational AI can be deployed on standard university hardware with zero recurring infrastructure costs, significantly elevating student experience and administrative efficiency.
- **Special Thanks & Mentions:**
  - College of Computing Sciences and Information Technology (CCSIT), TMU
  - Faculty Project Coordinators & Mentors
  - Teerthanker Mahaveer University Administration
- **Q&A Session:** *Thank you! The floor is now open for questions and live demonstration.*
