# AI Joke Generator — FastAPI + React + Tailwind Edition

A fine-tuned **GPT-2 Medium** joke generator with real-time SSE streaming, powered by **FastAPI**, **React 18**, **Tailwind CSS v4**, and **Lucide React** icons.

- **Hugging Face Model Hub**: [tejasoke/joke-generator-gpt2](https://huggingface.co/tejasoke/joke-generator-gpt2)
- **Creators**: Tejas Oke & Kartikey Singh

---

## 🗂️ Project Structure
```
Joke-Generator-App/
├── main.py                  ← FastAPI backend (local fine-tuned-gpt2 or Hugging Face Hub)
├── run.py                   ← Single-command launcher (python3 run.py)
├── frontend/                ← Modern React SPA
│   ├── src/
│   │   ├── components/      ← Header, StylePicker, TopicInput, JokeResult, StrictToggle, DeviceBadge
│   │   ├── api/jokeApi.js   ← API client
│   │   ├── hooks/           ← SSE streaming hook
│   │   └── index.css        ← Tailwind CSS v4 design tokens
│   ├── vite.config.js       ← Vite build config & proxy
│   └── package.json
├── fine-tuned-gpt2/         ← Local model weights (1.3 GB GPT-2 Medium)
├── requirements.txt         ← Backend Python dependencies
└── .venv/                   ← Python virtual environment
```

---

## 🚀 Run the App

### Single Command Launch
```bash
python3 run.py
```
This automatically starts the FastAPI server and launches the web app at **http://localhost:8000**.

### Mode 2: Development Mode (Vite HMR + FastAPI API)
```bash
# Terminal 1: Backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```
Open: **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/`                    | Serves the React SPA |
| `POST` | `/api/generate`        | Standard joke response (JSON) |
| `POST` | `/api/generate-stream` | Real-time SSE token stream |
| `GET`  | `/api/health`          | Health, hardware device & Hugging Face repo metadata |
| `GET`  | `/docs`                | Interactive Swagger UI |

---

## ☁️ Deployment on Vercel

### Architecture for ML on Vercel
Vercel is optimized for frontend applications, but serverless functions cannot package a 1.4 GB PyTorch model (`GPT-2 Medium`). The standard production pattern is:
1. **Frontend (React + Tailwind + Lucide)** ➔ Deployed to **Vercel** (lightning-fast global CDN).
2. **Backend (FastAPI + GPT-2)** ➔ Deployed to **Hugging Face Spaces (Free)**, **Render**, or **Railway** (using the provided [`Dockerfile`](file:///Users/tejasoke/Downloads/Adult-Joke-Generator-main/Joke-Generator-App/Dockerfile)).

### Step 1: Deploy Backend (FastAPI)
Deploy the FastAPI backend to any container/Python platform:
- **Hugging Face Spaces (Recommended - Free 16GB RAM)**: Create a new Space with the Docker SDK, connect this repo, and it will load [`tejasoke/joke-generator-gpt2`](https://huggingface.co/tejasoke/joke-generator-gpt2) automatically.
- **Render / Railway**: Connect repo, use the provided `Dockerfile`.

### Step 2: Deploy Frontend on Vercel
1. Import this repository into Vercel.
2. In the Vercel project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `cd frontend && npm install && npm run build` (or leave default if Root Directory is set to `frontend`)
   - **Output Directory**: `frontend/dist` (or `dist` if Root Directory is `frontend`)
3. Add Environment Variable in Vercel:
   - `VITE_API_BASE_URL` = `https://your-backend-service-url.com` (your deployed FastAPI URL)
4. Click **Deploy**!

---

## 🤖 Hugging Face Model Source
The backend supports loading either from the local `fine-tuned-gpt2/` folder or directly from Hugging Face Hub:
- Repo: `tejasoke/joke-generator-gpt2`
- URL: `https://huggingface.co/tejasoke/joke-generator-gpt2`
