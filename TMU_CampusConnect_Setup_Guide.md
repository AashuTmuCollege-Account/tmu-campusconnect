# 🎓 TMU CampusConnect — Complete Setup & Deployment Guide
## For Teerthanker Mahaveer University | Step-by-Step for Beginners

> ⚡ **FAST TRACK (RECOMMENDED):**
> You do **not** need to do manual steps anymore! Simply double-click **`ONE_CLICK_INSTALLER.bat`**.
> It opens the **TMU CampusConnect Universal Deployment Hub** with TMU Amber theme and automated system diagnostics. It will automatically detect or install Python 3.12, Ollama, download local models, heal dependencies, and provide a **Quick Launch & Deploy Hub** tab with one-click buttons.

---

## 📋 What We Are Installing

Think of these as 4 things your computer needs:

| Tool | What it does | Cost |
|------|-------------|------|
| **Python 3.12** | The language the chatbot runs on | Free |
| **Ollama** | Runs the AI "brain" locally on your PC | Free |
| **AI Models** | The intelligence (like downloading a smart brain) | Free |
| **TMU CampusConnect** | The chatbot software itself | Free (already built!) |

---

## ⏱️ How Long Will This Take?

| Step | Time |
|------|------|
| Download & install Python + Ollama | ~10–15 minutes |
| Download AI models | ~20–60 minutes (depends on internet) |
| First-time setup | ~5 minutes |
| **Total** | **~1 hour** |

---

---

# 🔵 PART 1 — Install Python 3.12

Python is needed to run the chatbot. Think of it like installing Microsoft Word so you can open Word files — you need Python to run the chatbot.

---

### Step 1 — Open a Web Browser
Click on **Google Chrome** or **Microsoft Edge** from your taskbar (the bar at the bottom of the screen).

---

### Step 2 — Go to Python Download Page
In the browser address bar at the top, click and type exactly:
```
https://www.python.org/downloads/release/python-3128/
```
Press **Enter**.

---

### Step 3 — Download Python 3.12
Scroll down until you see **"Files"** section. Click the link called:
```
Windows installer (64-bit)
```
A file will start downloading (about 25 MB).

---

### Step 4 — Install Python

1. Go to your **Downloads** folder (folder icon on taskbar → Downloads on left)
2. Find the file named `python-3.12.8-amd64.exe` and **double-click** it
3. A window opens — **VERY IMPORTANT:** Before clicking anything else:
   - ✅ **CHECK the box that says "Add Python 3.12 to PATH"** at the bottom
   - ✅ Check **"Use admin privileges"** if visible
4. Click **"Install Now"**
5. Wait for installation (1–2 minutes)
6. Click **Close** when done

---

### Step 5 — Verify Python Installed
1. Press **Windows key** on your keyboard (the key with the Windows logo)
2. Type: `cmd`
3. Click on **Command Prompt** that appears
4. In the black window, type:
   ```
   py -3.12 --version
   ```
5. Press **Enter**. You should see: `Python 3.12.8`

✅ If you see the version — Python is installed correctly!
❌ If you see an error — Go back and repeat Step 4, make sure you checked "Add Python to PATH"

---

---

# 🟢 PART 2 — Install Ollama (the AI Engine)

Ollama is what runs the AI brain on your computer. Without it, the chatbot can't think.

---

### Step 6 — Download Ollama
Open your browser again and go to:
```
https://ollama.com/download/windows
```
Click the big **"Download for Windows"** button. Download file is about 60 MB.

---

### Step 7 — Install Ollama
1. Go to Downloads folder
2. Double-click `OllamaSetup.exe`
3. Click **Yes** if it asks permission
4. Wait for installation (1–2 minutes)
5. Ollama will start automatically in the background (you'll see a small icon in the bottom-right taskbar near the clock)

---

### Step 8 — Verify Ollama is Running
1. Open **Command Prompt** again (Windows key → type `cmd` → Enter)
2. Type:
   ```
   ollama list
   ```
3. Press **Enter**. You should see an empty list (that's fine, we haven't downloaded models yet).

✅ If it shows a list (even empty) — Ollama is working!
❌ If it says "ollama is not recognized" — Restart your PC and try again.

---

---

# 🟡 PART 3 — Download AI Models

This is like downloading the "brain" for the chatbot. These are large files (4–5 GB total).

---

### Step 9 — Download the Chat Model
In Command Prompt, type exactly:
```
ollama pull llama3.2:3b
```
Press **Enter**.

You'll see a progress bar. Wait for it to finish. This takes **10–30 minutes** depending on internet speed.

---

### Step 10 — Download the Embedding Model
After the first model finishes, type:
```
ollama pull mxbai-embed-large
```
Press **Enter**.

Wait for this to finish too (~670 MB, about 5–10 minutes).

---

### Step 11 — Verify Both Models Downloaded
Type:
```
ollama list
```
You should see both:
- `llama3.2:3b`
- `mxbai-embed-large`

✅ Both listed — you're ready for the next part!

---

---

# 🔴 PART 4 — Set Up TMU CampusConnect

---

### Step 12 — Open the Project Folder
Open **File Explorer** (the yellow folder icon on taskbar).

Navigate to this folder:
```
C:\Users\Aashutosh Singh Rawa\.gemini\antigravity\scratch\tmu-campusconnect\backend
```

> 💡 **Tip:** You can click in the address bar at the top of File Explorer, delete what's there, type the path above, and press Enter.

---

### Step 13 — Run SETUP.bat (First Time Only!)
Inside the `backend` folder, find the file called **`SETUP.bat`**.

**Double-click it.**

A black window will open and you'll see text scrolling. Wait for it to finish. It will say:
```
Setup Complete!
Run START_SERVER.bat to launch TMU CampusConnect.
```

Then press any key to close it.

> ⚠️ If it shows an error about Python not found — go back to Step 4 and reinstall Python with the PATH checkbox checked.

---

### Step 14 — Start TMU CampusConnect
Still in the `backend` folder, find **`START_SERVER.bat`** and **double-click it**.

Three black windows will open:
1. One checks Ollama
2. One starts the chatbot server (keep this one open!)
3. One starts the internet tunnel (ngrok)

When done, it shows:
```
ALL DONE - TMU CampusConnect is running!
```

**Do NOT close any of these windows.** Minimise them instead.

---

### Step 15 — Open the Admin Panel
The Start Server window will show a message like:
```
Press any key to open the Admin Panel...
```

Press any key, and your browser will open to:
```
http://localhost:8000/panel/
```

You'll see the **TMU CampusConnect login screen**!

---

### Step 16 — First Login
- **Username:** `admin`
- **Password:** `admin123`

Click **Sign In**.

---

### Step 17 — Change Your Password (VERY IMPORTANT!)
1. Click **Settings** (⚙️) in the left sidebar
2. Scroll down to **"Change My Password"**
3. Enter `admin123` in "Current Password"
4. Enter your new strong password in "New Password"
5. Click **Update Password**

Write down your new password somewhere safe!

---

---

# 🟠 PART 5 — Add TMU Knowledge to the Bot

Right now the bot is empty — it doesn't know anything about TMU yet. You need to teach it.

---

### Step 18 — Go to Knowledge Base
Click **📚 Knowledge Base** in the left sidebar.

---

### Step 19 — Add Your First Knowledge
Click **+ Add Knowledge** button.

A popup opens. You can either:
- **Paste Text** — Copy-paste information directly
- **Upload File** — Upload a PDF or TXT file

---

### Step 20 — What to Add
Here are examples of knowledge to add:

**Example 1: University Overview**
- Name: `TMU University Overview`
- Content: Paste information about TMU from the website

**Example 2: Fee Structure**
- Name: `Fee Structure 2025`
- Content: Upload the fee structure PDF

**Example 3: Courses Available**
- Name: `Courses and Programs`
- Content: Paste list of all courses with duration

**Keep adding topics until the bot knows everything!**

---

---

# 🌍 PART 6 — Access from Anywhere (Internet)

---

### Step 21 — Sharing the Bot with Students

TMU CampusConnect is already configured to work over the internet!

Share these links with students, teachers, and parents:

| What | Link |
|------|------|
| 💬 Chat with the bot | `https://unstuffed-flyover-answering.ngrok-free.dev/widget/` |
| 🔧 Admin Panel | `https://unstuffed-flyover-answering.ngrok-free.dev/panel/` |

> These links work from **anywhere in the world** — mobile phone, laptop, any network!

---

### Step 22 — Add the Bot to TMU Website
To put the chatbot on your university website, ask your web developer to add this one line to the website HTML before `</body>`:

```html
<script src="https://unstuffed-flyover-answering.ngrok-free.dev/widget/embed.js"></script>
```

A floating 🎓 button will automatically appear on every page of the website!

---

---

# 👤 PART 7 — Managing Users

---

### Step 23 — Add a Teacher Account
1. Click **👥 Users** in the left sidebar
2. Click **+ Add User**
3. Fill in:
   - Username: `teacher_name` (no spaces)
   - Full Name: Their full name
   - Email: Their email
   - Password: A password for them
   - Role: Select **Teacher**
4. Click **Create User**

Teachers can now log in to the Admin Panel and upload knowledge — but they can't manage users or change system settings.

---

### Step 24 — Daily Operations

**Every day when you want the bot to work:**
1. Just double-click `START_SERVER.bat`
2. Wait for "ALL DONE" message
3. Minimise the windows — don't close them!

**To stop the bot:**
- Close all the black Command Prompt windows

**To keep the bot running 24/7 automatically:**
- See the "Running 24/7" section in README.md

---

---

# 🆘 Common Problems & Solutions

| Problem | Solution |
|---------|----------|
| SETUP.bat fails | Reinstall Python 3.12, check "Add to PATH" |
| "bcrypt error" on start | Double-click `FIX_DEPENDENCIES.bat` |
| "Could not reach server" in chat | Make sure `START_SERVER.bat` windows are still open |
| Bot gives wrong/no answers | Add more knowledge via Knowledge Base |
| Forgot admin password | Delete `backend\data\tmu_campusconnect.db`, run SETUP.bat again |
| Chat works locally but not internet | Make sure the ngrok window is open (3rd black window from START_SERVER.bat) |

---

## 📞 TMU Contact Information Pre-Loaded in Bot

The bot already knows to refer students to:
- **📞 Toll-Free:** 1800-270-1490
- **🌐 Website:** www.tmu.ac.in
- **📧 Email:** admissions@tmu.ac.in

---

## ✅ Setup Complete Checklist

- [ ] Python 3.12 installed with PATH checked
- [ ] Ollama installed
- [ ] `llama3.2:3b` model downloaded
- [ ] `mxbai-embed-large` model downloaded
- [ ] SETUP.bat run successfully
- [ ] START_SERVER.bat running
- [ ] Admin panel accessible at http://localhost:8000/panel/
- [ ] Admin password changed from default
- [ ] TMU knowledge uploaded (at least basic info)
- [ ] Internet access verified via ngrok URL

---

*TMU CampusConnect — Built for Teerthanker Mahaveer University*
*Powered by Ollama + Llama 3.2 + ChromaDB | 100% offline, 100% private*
