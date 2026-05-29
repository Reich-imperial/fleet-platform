# Fleet Management Platform

Production-style fleet management system for oil tanker and logistics operations.

## Stack
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Cache:** Redis
- **Reverse proxy:** Nginx
- **Infrastructure:** AWS (Terraform)
- **CI/CD:** GitHub Actions

## Getting started

```bash
# 1. Copy env files and fill in values
cp backend/.env.example backend/.env

# 2. Start all services
docker compose up --build

# 3. Run migrations (once containers are up)
docker compose exec backend npm run migrate
```

## Project structure
See `/docs/architecture.md` for full system design.
