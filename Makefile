.PHONY: dev build stop restart logs clean shell-backend shell-db

# ── Local development ─────────────────────────────────────────────────────────
dev:
	docker compose up

dev-build:
	docker compose up --build

stop:
	docker compose down

restart:
	docker compose restart backend

restart-all:
	docker compose down && docker compose up --build

# ── Logs ──────────────────────────────────────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs backend -f --tail=50

logs-frontend:
	docker compose logs frontend -f --tail=50

# ── Database ──────────────────────────────────────────────────────────────────
db-migrate:
	docker compose exec backend alembic upgrade head

db-revision:
	docker compose exec backend alembic revision --autogenerate -m "$(msg)"

db-rollback:
	docker compose exec backend alembic downgrade -1

# ── Shell access ──────────────────────────────────────────────────────────────
shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec postgres psql -U careertwin -d careertwin_db

# ── Clean ─────────────────────────────────────────────────────────────────────
clean:
	docker compose down -v
	docker system prune -f

# ── Frontend dev (local without Docker) ──────────────────────────────────────
frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

# ── Quick health check ────────────────────────────────────────────────────────
health:
	curl -s http://localhost:8000/api/health | python3 -m json.tool

env-check:
	curl -s http://localhost:8000/api/v1/debug/env | python3 -m json.tool

test-ai:
	curl -s http://localhost:8000/api/v1/debug/test-ai | python3 -m json.tool
