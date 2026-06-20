# How to Upgrade from v1 to v2

## What Changed

| Area | v1 | v2 |
|------|----|----|
| Color scheme | Purple/indigo | Dark navy + electric blue + emerald |
| Landing page | Basic | Premium with testimonials, steps, stats |
| Navigation | Desktop only | Desktop sidebar + mobile drawer |
| Loading states | Spinners | Skeleton screens + AI step indicators |
| Dashboard | Basic cards | Score ring, radar, progress history |
| Onboarding | None | 4-step guided wizard |
| Interview page | Missing | Full tracker with form |
| Rate limiting | None | Per-user limits on all AI endpoints |
| Security headers | None | X-Content-Type, X-Frame-Options, etc |
| Mobile support | Poor | Full responsive with hamburger menu |

---

## Apply v2 Frontend (replace entire frontend/src)

```bash
# Backup your current frontend
cp -r frontend/src frontend/src.v1.backup

# Copy new frontend files
cp -r careertwin-v2/frontend/src          frontend/
cp    careertwin-v2/frontend/tailwind.config.js frontend/
cp    careertwin-v2/frontend/package.json frontend/

# Reinstall (new tailwind config needs a clean install)
cd frontend
rm -rf node_modules
npm install
```

## Apply v2 Backend Changes

```bash
# Rate limiting middleware (new file)
mkdir -p backend/app/middleware
cp careertwin-v2/backend/app/middleware/rate_limit.py backend/app/middleware/
touch backend/app/middleware/__init__.py

# Updated files
cp careertwin-v2/backend/app/main.py          backend/app/main.py
cp careertwin-v2/backend/app/routers/resume.py backend/app/routers/resume.py
```

## Rebuild Docker

```bash
docker compose down
docker compose up --build
```

## Verify

1. `http://localhost:3000` — new dark navy landing page
2. Register new account → redirected to onboarding wizard
3. Upload resume → skeleton loading, then results
4. Dashboard → score ring, radar chart, progress history
5. Mobile: resize browser → hamburger menu appears
