# Push to GitHub & Deploy — Step by Step

This walks you through getting CareerTwin AI from your laptop → GitHub → a live URL you can share for review.

---

## Part 1 — Push to GitHub

### 1. Create a GitHub repo
Go to **https://github.com/new**
- Repository name: `careertwin-ai`
- Visibility: Public (so reviewers can see it) or Private (if you'll add them as collaborators)
- **Do NOT** check "Add README" — you already have one
- Click **Create repository**

### 2. Push your local project

Open your terminal in the project root (`careertwin-v2` folder):

```powershell
git init
git add .
git status   # ← double check .env is NOT listed here. If it is, your .gitignore isn't working — stop and fix it first.

git commit -m "Initial commit — CareerTwin AI v2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/careertwin-ai.git
git push -u origin main
```

**Critical check:** run `git status` before committing. If `.env` shows up as a file to be committed, **do not push**. Run `git rm --cached .env` first, confirm `.gitignore` has `.env` in it, then commit again. Your Gemini API key and JWT secret must never reach GitHub.

---

## Part 2 — Deploy Backend (Railway)

1. Go to **https://railway.app** → Sign in with GitHub
2. **New Project** → **Deploy from GitHub repo** → select `careertwin-ai`
3. Railway detects the Dockerfile. Click on the new service → **Settings**:
   - **Root Directory**: `backend`
4. Click **"+ New"** (top of project canvas) → **Database** → **PostgreSQL** → it auto-provisions
5. Click **"+ New"** → **Database** → **Redis** → it auto-provisions
6. Click your backend service → **Variables** tab → add:

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | your real key from aistudio.google.com |
| `SECRET_KEY` | run `python -c "import secrets; print(secrets.token_hex(32))"` locally and paste the output |
| `DATABASE_URL` | click "Add Reference" → select the Postgres service → `DATABASE_URL` |
| `REDIS_URL` | click "Add Reference" → select the Redis service → `REDIS_URL` |
| `DEBUG` | `False` |
| `ALLOWED_ORIGINS` | `["*"]` for now — tighten after frontend is deployed |

7. Click **Deploy**. Once live, click the service → **Settings** → **Networking** → **Generate Domain**. You'll get a URL like:
```
https://careertwin-backend-production.up.railway.app
```

8. Run migrations — click your backend service → **Shell** tab (top right):
```bash
alembic upgrade head
```

9. Verify it's alive — open in browser:
```
https://your-backend-url.up.railway.app/api/health
https://your-backend-url.up.railway.app/api/docs
```

---

## Part 3 — Deploy Frontend (Vercel)

1. Go to **https://vercel.com** → Sign in with GitHub
2. **Add New** → **Project** → import `careertwin-ai`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. **Environment Variables** → add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend-url.up.railway.app/api/v1` |

5. Click **Deploy**. You'll get a live URL like:
```
https://careertwin-ai.vercel.app
```

### Update backend CORS
Go back to Railway → backend service → Variables → update:
```
ALLOWED_ORIGINS = ["https://careertwin-ai.vercel.app"]
```
Redeploy the backend (Railway auto-redeploys on variable change).

---

## Part 4 — Share for Review

Send reviewers:
```
🔗 Live app: https://careertwin-ai.vercel.app
📖 API docs: https://your-backend-url.up.railway.app/api/docs
```

They can register an account and try the full flow — no setup needed on their end.

---

## Updating after changes

Whenever you push new commits to `main`, both Railway and Vercel **auto-redeploy**:

```bash
git add .
git commit -m "Describe your change"
git push
```

That's it — both platforms watch your GitHub repo and rebuild automatically.

---

## Common Issues

| Problem | Fix |
|---|---|
| Frontend shows blank page | Check `VITE_API_URL` is set correctly in Vercel env vars, then redeploy |
| `CORS error` in browser console | `ALLOWED_ORIGINS` on Railway doesn't match your exact Vercel URL |
| `502` on every API call | Migrations not run — go to Railway Shell, run `alembic upgrade head` |
| Build fails on Railway | Check Root Directory is set to `backend`, not the repo root |
| Build fails on Vercel | Check Root Directory is set to `frontend` |
