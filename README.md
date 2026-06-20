<div align="center">

# 🎯 CareerTwin AI

**Your Digital Twin for Placements and Career Growth**

An AI-powered employability intelligence platform that predicts career readiness, identifies skill gaps, simulates "what-if" career scenarios, and generates personalized roadmaps — built for B.Tech students and job seekers targeting Indian tech placements.

[![Live Demo](https://img.shields.io/badge/demo-live-4F8DFF?style=for-the-badge)](https://your-app.vercel.app)
[![API Docs](https://img.shields.io/badge/API-docs-2DD4F4?style=for-the-badge)](https://your-backend.up.railway.app/api/docs)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5-AI-4285F4?style=flat&logo=google&logoColor=white)

</div>

---

## 🌐 Live Links

| | |
|---|---|
| **Live App** | https://your-app.vercel.app |
| **API Documentation** | https://your-backend.up.railway.app/api/docs |
| **Health Check** | https://your-backend.up.railway.app/api/health |

> Replace the URLs above with your actual deployed links once you've completed [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md).

---

## ✨ What It Does

CareerTwin AI is not a resume analyzer — it's a career operating system. It treats every student as a **Digital Twin**: a living profile that gets continuously evaluated, scored, and improved.

```
Upload Resume → AI Analysis → Employability Score → Skill Gaps → 
Personalized Roadmap → Career Simulation → Company Match → Track Interviews
```

| Module | What it does |
|---|---|
| 📄 **Resume Intelligence** | Upload a PDF → AI extracts skills, projects, education, experience → generates Resume Score + ATS Score + improvement suggestions |
| 🤖 **Digital Twin Engine** | Builds a full career profile — 7 category scores + 7 role-readiness scores (backend, frontend, cloud, DevOps, system design, DSA, interview) |
| 🔍 **Skill Gap Prediction** | Identifies exactly what's missing for your target role, with an estimated employability boost (%) per skill |
| ⚡ **Career Simulation** | "What if I learn Docker and get AWS certified?" → AI predicts your future score, timeline, and milestones |
| 🗺️ **AI Roadmap Generator** | Personalized 30/60/90-day learning plans — broken into weekly tasks with resources and priority |
| 🏢 **Company Match Engine** | Compatibility score against any company (Amazon, Flipkart, Razorpay, Swiggy, etc.) with tailored interview tips |
| 🎯 **Interview Tracker** | Log interview experiences, ratings, and outcomes to spot patterns over time |
| 📊 **Progress Tracking** | Historical snapshots of your employability score so you can see real growth |

---

## 🖥️ Tech Stack

**Backend**
- Python 3.11 + FastAPI
- PostgreSQL + SQLAlchemy ORM + Alembic migrations
- Redis (caching)
- Google Gemini 2.5 Flash (all 6 AI agents)
- PyMuPDF (PDF text extraction)
- JWT auth (python-jose + passlib/bcrypt)
- Per-user rate limiting middleware

**Frontend**
- React 18 + Vite
- Tailwind CSS (custom premium design system)
- Recharts (radar / line / area charts)
- React Router v6
- Axios + React Hot Toast

**Infrastructure**
- Docker + Docker Compose (local dev)
- Railway (backend + Postgres + Redis hosting)
- Vercel (frontend hosting)
- GitHub Actions (CI/CD)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- A free Gemini API key → https://aistudio.google.com/app/apikey

### Run it

```bash
git clone https://github.com/YOUR_USERNAME/careertwin-ai.git
cd careertwin-ai

cp .env.example .env
# Edit .env — add your GEMINI_API_KEY and a random SECRET_KEY

docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/api/docs |

### First-time setup checklist
```
□ Register an account → guided through 4-step onboarding
□ Upload your resume (PDF)
□ Generate your Digital Twin
□ Explore your roadmap, run a simulation, check a company match
```

---

## 🌍 Deploying Your Own Copy

Full step-by-step guide: **[GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md)**

Quick version:
1. Push this repo to your own GitHub
2. Deploy `backend/` to **Railway** (free tier, includes Postgres + Redis)
3. Deploy `frontend/` to **Vercel** (free tier)
4. Point `VITE_API_URL` (Vercel) at your Railway backend URL
5. Update `ALLOWED_ORIGINS` (Railway) to your Vercel URL

Total cost: **$0/month** on free tiers for moderate usage.

---

## 🗄️ Accessing the Database

Full guide: **[DATABASE_ACCESS.md](./DATABASE_ACCESS.md)**

Quickest method — Railway's built-in data browser:
1. Railway dashboard → your PostgreSQL service → **"Data"** tab
2. Browse tables, run SQL, export data — no setup required

For regular use, connect a free GUI client (TablePlus / DBeaver) using the `DATABASE_URL` from Railway's **Connect** tab.

---

## 📁 Project Structure

```
careertwin-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point, middleware, security headers
│   │   ├── config.py                # Settings from environment variables
│   │   ├── database.py              # SQLAlchemy engine & session
│   │   ├── models/                  # User, Resume, DigitalTwin, Roadmap, Interview, etc.
│   │   ├── schemas/                 # Pydantic request/response models
│   │   ├── routers/                 # auth, resume, twin, skills, roadmap, simulation, company, interview, debug
│   │   ├── services/
│   │   │   └── ai_service.py        # 6 Gemini AI agents with retry/backoff + robust JSON parsing
│   │   ├── middleware/
│   │   │   └── rate_limit.py        # Per-user rate limiting on AI endpoints
│   │   └── utils/                   # JWT handling, PDF parsing, caching
│   ├── alembic/                     # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/                   # Landing, Onboarding, Dashboard, Resume, DigitalTwin,
│   │   │                            #   Roadmap, Simulation, CompanyMatch, Interview, Profile
│   │   ├── components/
│   │   │   ├── Layout.jsx           # App shell
│   │   │   ├── Sidebar.jsx          # Desktop sidebar + mobile drawer
│   │   │   └── UI.jsx               # ScoreRing, SkillChip, AILoader, Skeletons, EmptyState
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js          # Axios layer for all endpoints
│   │   └── index.css                # Full design system (cards, buttons, badges, gradients)
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── railway.json / render.yaml / vercel.json   # Deployment configs
├── .github/workflows/deploy.yml     # CI/CD pipeline
├── Makefile                         # Dev convenience commands
├── .env.example
├── GITHUB_DEPLOY.md                 # Push + deploy walkthrough
├── DATABASE_ACCESS.md               # How to view/query production data
└── README.md                        # This file
```

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create account, returns JWT |
| `POST` | `/api/v1/auth/login` | Login, returns JWT |
| `GET`  | `/api/v1/auth/me` | Current user profile |
| `PUT`  | `/api/v1/auth/me` | Update profile (role, links, education) |
| `POST` | `/api/v1/resume/upload` | Upload PDF → AI analysis |
| `GET`  | `/api/v1/resume/active` | Get latest resume analysis |
| `POST` | `/api/v1/twin/generate` | Generate/refresh Digital Twin |
| `GET`  | `/api/v1/twin/me` | Get current Twin |
| `GET`  | `/api/v1/twin/snapshots` | Score history over time |
| `POST` | `/api/v1/skills/gaps` | Skill gap analysis for a target role |
| `POST` | `/api/v1/roadmap/generate/{plan_type}` | Generate 30/60/90-day roadmap |
| `POST` | `/api/v1/simulation/run` | Run a "what-if" career simulation |
| `POST` | `/api/v1/company/match` | Get compatibility score for a company |
| `POST` | `/api/v1/interview/log` | Log an interview experience |
| `GET`  | `/api/v1/interview/history` | List logged interviews |

Full interactive documentation with request/response schemas: **`/api/docs`**

---

## 🤖 AI Architecture

All AI features run through 6 specialized Gemini agents in `app/services/ai_service.py`, each with a structured-JSON prompt and automatic retry with exponential backoff for transient API errors (503/429):

1. **Resume Analyzer** — extraction + ATS scoring + improvement suggestions
2. **Employability Engine** — 7 category scores + 7 readiness scores + reasoning
3. **Skill Gap Predictor** — missing skills ranked by employability impact
4. **Roadmap Generator** — week-by-week tasks with resources and priority
5. **Career Simulator** — projects score changes from hypothetical scenarios
6. **Company Matcher** — compatibility scoring + tailored interview tips

---

## 🔒 Security Features

- JWT authentication with bcrypt password hashing
- Per-user rate limiting (20 AI calls/min, 5 uploads/min, 3 twin regenerations/5min)
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- `.env`-based secrets, never committed (enforced via `.gitignore`)
- Input validation on every endpoint via Pydantic schemas

---

## 🗺️ Roadmap

**Shipped (v2)**
- ✅ All 8 core modules
- ✅ 4-step onboarding wizard
- ✅ Mobile-responsive layout
- ✅ Skeleton loading states
- ✅ Rate limiting & retry logic

**Planned**
- 🔲 Real GitHub API integration (live repo analysis)
- 🔲 Real LeetCode API integration (live DSA stats)
- 🔲 Email digest of weekly progress
- 🔲 Peer benchmarking
- 🔲 Job listing integration

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
# make changes
git commit -m "Add: your feature description"
git push origin feature/your-feature
# open a Pull Request
```

---

## 📄 License

MIT — free to use as a portfolio project or starting point for your own SaaS.

---

<div align="center">

Built for B.Tech students targeting top Indian tech placements 🇮🇳

</div>
