# Accessing Your Database

Once deployed, your data lives in Railway's managed PostgreSQL. Here are 4 ways to access it, from easiest to most powerful.

---

## Option 1 — Railway's Built-in Data Viewer (Easiest, No Setup)

1. Go to your Railway project dashboard
2. Click the **PostgreSQL** service
3. Click the **"Data"** tab
4. Browse tables, click any row to edit, run raw SQL in the query box at the top

This is the fastest way to peek at users, resumes, or scores without installing anything.

---

## Option 2 — Railway CLI (psql in your terminal)

```bash
# Install Railway CLI (one-time)
npm install -g @railway/cli

# Login
railway login

# Link to your project (run inside your project folder)
railway link

# Open a direct psql shell into your database
railway connect postgres
```

You're now in a live `psql` session:
```sql
\dt                          -- list all tables
SELECT * FROM users LIMIT 10;
SELECT email, target_role FROM users;
SELECT COUNT(*) FROM resumes;
\q                            -- quit
```

---

## Option 3 — GUI Database Client (Best for regular use)

Use a free desktop app for a proper spreadsheet-like view, easy editing, and exporting data.

**Recommended: TablePlus** (https://tableplus.com) or **DBeaver** (free, https://dbeaver.io)

### Get your connection string
1. Railway → PostgreSQL service → **"Connect"** tab
2. Copy the **`DATABASE_URL`** — it looks like:
```
postgresql://postgres:PASSWORD@viaduct.proxy.rlwy.net:12345/railway
```

### Connect in TablePlus / DBeaver
- **Host**: the part after `@` and before `:` (e.g. `viaduct.proxy.rlwy.net`)
- **Port**: the number after the host (e.g. `12345`)
- **User**: `postgres`
- **Password**: the part between `:` and `@`
- **Database**: the part after the last `/` (e.g. `railway`)
- **SSL**: enable "Require" or "Allow"

Once connected, you get a full visual table browser — click any table, see all rows, edit cells, run SQL queries, export to CSV.

---

## Option 4 — Direct psql (if you have PostgreSQL installed locally)

```bash
psql "postgresql://postgres:PASSWORD@viaduct.proxy.rlwy.net:12345/railway"
```

Paste your full `DATABASE_URL` from Railway's Connect tab directly — psql accepts the full URL.

---

## Useful Queries for CareerTwin AI

```sql
-- See all registered users
SELECT id, email, full_name, target_role, created_at FROM users ORDER BY created_at DESC;

-- Count users
SELECT COUNT(*) FROM users;

-- See resumes uploaded today
SELECT u.email, r.filename, r.resume_score, r.ats_score, r.created_at
FROM resumes r JOIN users u ON r.user_id = u.id
WHERE r.created_at > NOW() - INTERVAL '1 day';

-- Average employability score across all users
SELECT AVG(employability_score) FROM digital_twins;

-- Most common missing skills (requires JSON parsing — view in app instead, easier)

-- Delete a test user and all their data (cascades automatically)
DELETE FROM users WHERE email = 'test@example.com';
```

---

## Security Notes

- **Never share your `DATABASE_URL` publicly** — it's a master password to all user data
- Railway's free Postgres is for development/demo use; for real production with paying users, consider a dedicated managed DB with backups (Railway Pro, Supabase, or Neon)
- If you ever accidentally commit `DATABASE_URL` or `.env` to GitHub, rotate the password immediately via Railway → Postgres service → Variables → regenerate

---

## Backing Up Your Data

```bash
# Export full database to a file (run locally with Railway CLI linked)
railway run pg_dump $DATABASE_URL > backup.sql

# Restore from a backup
railway run psql $DATABASE_URL < backup.sql
```
