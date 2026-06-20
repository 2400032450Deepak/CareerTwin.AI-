# CareerTwin AI v2 — Deployment Guide

## 🏆 Recommended: Railway (Backend) + Vercel (Frontend)

**Why this combo?**
- Railway: Docker-native, free $5/month credits, PostgreSQL + Redis built-in, no sleep
- Vercel: Best React hosting, global CDN, free tier, instant deploys

---

## OPTION A — Full Docker (Local or VPS)

```bash
# 1. Clone / extract project
cd careertwin-ai

# 2. Create env file
cp .env.example .env
# Edit .env — add GEMINI_API_KEY and change SECRET_KEY

# 3. Start everything
docker compose up --build

# Access:
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# API Docs → http://localhost:8000/api/docs
```

---

## OPTION B — Railway + Vercel (Recommended Free Production)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "CareerTwin AI v2"
git remote add origin https://github.com/YOUR_USERNAME/careertwin-ai.git
git push -u origin main
```

### Step 2 — Deploy Backend to Railway

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repo
4. Railway auto-detects Docker — it will build the backend

**Add services:**
- Click **"+ New"** → **"Database"** → **"PostgreSQL"** → Add
- Click **"+ New"** → **"Database"** → **"Redis"** → Add

**Set environment variables** on the backend service:
```
GEMINI_API_KEY     = your-key-from-aistudio
SECRET_KEY         = (run: python -c "import secrets; print(secrets.token_hex(32))")
DATABASE_URL       = (copy from PostgreSQL service → "Connect" tab → "DATABASE_URL")
REDIS_URL          = (copy from Redis service → "Connect" tab → "REDIS_URL")
DEBUG              = False
```

**Set root directory** in Railway settings → Source → Root Directory: `backend`

5. Deploy — Railway builds and starts your API
6. Copy your Railway backend URL: `https://your-app.up.railway.app`

### Step 3 — Deploy Frontend to Vercel

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"** → Import your repo
3. Set **Framework Preset**: Vite
4. Set **Root Directory**: `frontend`
5. Add environment variable:
```
VITE_API_URL = https://your-app.up.railway.app/api/v1
```
6. Click **Deploy**

### Step 4 — Update CORS on Backend

In Railway backend environment variables, add:
```
ALLOWED_ORIGINS = ["https://your-vercel-app.vercel.app"]
```

### Step 5 — Run Database Migrations

In Railway → your backend service → **"Shell"** tab:
```bash
alembic upgrade head
```

---

## OPTION C — Render (Alternative Free Tier)

Render has a free tier but services **sleep after 15 min of inactivity**.

```bash
# Uses render.yaml in the project root
# 1. Go to https://render.com
# 2. New → "Blueprint" → Connect GitHub repo
# 3. Render reads render.yaml and creates all services automatically
# 4. Add GEMINI_API_KEY in the backend service environment variables
```

**Limitation**: Free PostgreSQL expires after 90 days on Render.

---

## OPTION D — VPS (DigitalOcean / AWS / Hetzner)

For a real production deployment on a $6/month VPS:

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone repo
git clone https://github.com/YOUR_USERNAME/careertwin-ai.git
cd careertwin-ai

# 4. Set up env
cp .env.example .env
nano .env   # Add GEMINI_API_KEY and SECRET_KEY

# 5. Start
docker compose -f docker-compose.yml up -d --build

# 6. Set up Nginx reverse proxy (optional but recommended)
# Point your domain to VPS IP
# Use Certbot for HTTPS

# 7. Auto-restart on reboot
docker compose up -d
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | From https://aistudio.google.com/app/apikey |
| `SECRET_KEY` | ✅ Yes | Random 64-char string for JWT signing |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `REDIS_URL` | ✅ Yes | Redis connection string |
| `DEBUG` | No | Set `False` in production |
| `ALLOWED_ORIGINS` | No | Your frontend URL(s) |

---

## Post-Deployment Checklist

```
□ Visit /api/v1/debug/env  → all variables show SET ✅
□ Visit /api/v1/debug/test-ai → gemini shows OK ✅  
□ Register a test account on the frontend
□ Upload a resume and verify AI analysis works
□ Generate Digital Twin
□ Test roadmap generation
□ Check /api/docs for all endpoints
```

---

## Cost Estimate

| Platform | Monthly Cost |
|----------|-------------|
| Railway backend (free tier) | $0 (up to $5 credits) |
| Railway PostgreSQL | $0 (500MB free) |
| Railway Redis | $0 (25MB free) |
| Vercel frontend | $0 (100GB bandwidth free) |
| Gemini API | $0 (free tier: 1500 req/day) |
| **Total** | **$0/month** for moderate traffic |

For production with real users, upgrade Railway to $5/month plan for always-on + more resources.

---

## Useful Commands

```bash
make dev          # Start local Docker stack
make logs-backend # Watch backend logs
make health       # Check API health
make env-check    # Verify all env vars
make test-ai      # Test Gemini connection
make db-migrate   # Run latest migrations
make shell-db     # Open PostgreSQL shell
```
