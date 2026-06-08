# Fleet Management Platform

A production-style fleet management system for oil tanker and petroleum logistics operations. Built to practice and demonstrate real DevOps workflows — deployment, infrastructure as code, CI/CD pipelines, and observability.

> The goal of this project is not the application itself but the infrastructure and engineering practices around it.

---

## What it does

Manages the full operational lifecycle of a petroleum logistics fleet:

- Vehicle registry with availability tracking
- Driver management linked to user accounts
- Trip lifecycle with a strict state machine: `scheduled → dispatched → completed / cancelled`
- Fuel log recording per vehicle and trip
- Maintenance log tracking with service intervals
- Dashboard overview of fleet status, active trips, and recent activity
- JWT authentication with refresh token rotation via Redis

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 16 |
| Cache / Sessions | Redis 7 |
| Reverse proxy | Nginx |
| Containerisation | Docker + Docker Compose |
| Infrastructure | AWS (Terraform) |
| CI/CD | GitHub Actions — Phase 5 |
| Monitoring | Prometheus + Grafana — Phase 6 |

---

## Architecture

```
Internet
    │
    ▼
Nginx (port 80)          ← only container exposed to host
    ├── /api/*  → Backend (Express) → PostgreSQL
    │                              → Redis
    └── /*      → Frontend (React SPA)
```

All internal containers communicate over Docker's private network. PostgreSQL and Redis are never exposed to the host.

---

## Project phases

| Phase | Focus | Status |
|---|---|---|
| 1 | Application — auth, vehicles, drivers, trips, fuel, maintenance | ✅ Complete |
| 2 | Docker Compose — full local stack, health checks, named volumes | ✅ Complete |
| 3 | Manual AWS deployment — EC2, VPC, security groups, Docker on server | ✅ Complete |
| 4 | Terraform — infrastructure as code for everything in Phase 3 | ✅ Complete |
| 5 | CI/CD — GitHub Actions, ECR, automated deploy on push | ✅ Complete |
| 6 | Monitoring — Prometheus + Grafana in the stack | ✅ Complete |

---

## Getting started locally

### Prerequisites

- Docker and Docker Compose v2
- Git

### Run the stack

```bash
# 1. Clone the repo
git clone https://github.com/Reich-imperial/fleet-platform.git
cd fleet-platform

# 2. Create backend environment file
cp backend/.env.example backend/.env
# Edit backend/.env — fill in JWT secrets and confirm DB/Redis URLs

# 3. Start all containers
docker compose up --build

# 4. Run database migrations (first run only)
docker compose exec backend npm run migrate

# 5. Seed the database with sample data
docker compose exec backend npm run seed
```

The application will be available at `http://localhost`.

Default credentials after seeding:

| Email | Password | Role |
|---|---|---|
| admin@fleetops.local | Password123! | Admin |
| driver@fleetops.local | Password123! | Driver |

---

## Environment variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
NODE_ENV=production
PORT=3000

# PostgreSQL — use service name 'postgres' inside Docker, not localhost
DATABASE_URL=postgresql://fleet_user:fleet_pass@postgres:5432/fleet_db
DB_POOL_MAX=10

# Redis — use service name 'redis' inside Docker, not localhost
REDIS_URL=redis://redis:6379

# JWT — generate strong secrets with: openssl rand -base64 32
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS — set to your server's public IP or domain
CORS_ORIGIN=http://localhost
```

> Never commit `.env` to version control. It is in `.gitignore`.

---

## Useful commands

```bash
# Start stack in background
docker compose up -d

# View logs for a specific service
docker compose logs -f backend

# Run migrations
docker compose exec backend npm run migrate

# Re-seed the database
docker compose exec backend npm run seed

# Check container health
docker compose ps

# Stop the stack
docker compose down

# Stop and remove volumes (wipes database)
docker compose down -v
```

---

## Production deployment

Production runs the same Docker Compose stack on an AWS EC2 instance (`t3.small`, us-east-1) inside a custom VPC. The production override file adds restart policies, resource limits, and log rotation:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Infrastructure is fully codified in Terraform. See `/infra` for the complete configuration.

---

## Repository structure

```
fleet-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment config with Zod validation
│   │   ├── modules/         # Auth, vehicles, drivers, trips, fuel, maintenance
│   │   ├── middleware/       # Auth, error handling, validation
│   │   └── shared/          # Errors, password utils
│   ├── migrations/          # SQL migration files (run in order)
│   └── scripts/             # migrate.js, seed.js
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── api/             # Axios API client
│   │   └── hooks/           # Custom React hooksS
│   └── nginx.conf           # SPA fallback config for React Router
├── nginx/
│   └── nginx.conf           # Reverse proxy config
├── infra/                   # Terraform (Phase 4)
├── monitoring/              # Prometheus + Grafana (Phase 6)
├── docker-compose.yml       # Base Compose config
└── docker-compose.prod.yml  # Production overrides
|__ docker-compose.ecr.yml   # AWS ECR overrides [optional]
|__ docker-compose.monitoring # Monitoring overrides
```

---

## Key engineering decisions

**Why Docker Compose over Kubernetes?**
This is a single-server portfolio deployment. Compose is the right tool for this scale. Kubernetes is planned as a separate learning track.

**Why only Nginx is port-mapped to the host?**
All other containers (backend, frontend, postgres, redis) communicate over Docker's internal network. Exposing database ports to the host is a common misconfiguration — this stack avoids it intentionally.

**Why Redis for refresh tokens?**
Storing JWT refresh tokens in Redis allows instant invalidation on logout — something you cannot do with stateless JWTs alone. TTL is set to 7 days, matching the token expiry.

**Why Zod for environment validation?**
The backend validates all environment variables at startup using Zod. If any required variable is missing or malformed, the process exits immediately with a clear error message — not a runtime crash deep in a service call.

---

## LinkedIn series

This project is documented as a public build series on LinkedIn:
[linkedin.com/in/samson-olanipekun-devops](https://linkedin.com/in/samson-olanipekun-devops)

Each phase is posted as a standalone article covering the decisions, mistakes, and lessons from that phase.

---

## Author

Samson Ayodele — DevOps / Cloud Engineering  
GitHub: [github.com/Reich-imperial](https://github.com/Reich-imperial)  
Portfolio: [me.helixn8n.cfd](https://me.helixn8n.cfd)
---

## Infrastructure (Phase 4 — Terraform)

All AWS infrastructure is defined as code in `/infra`. A single `terraform apply` provisions the complete environment with zero manual steps.

### What Terraform creates

| Resource | Configuration |
|---|---|
| VPC | `10.0.0.0/16`, DNS support and hostnames enabled |
| Public subnet | `10.0.1.0/24` in `us-east-1a`, auto-assign public IP |
| Internet gateway | Attached to VPC |
| Route table | `0.0.0.0/0 → IGW`, associated to public subnet |
| Security group | SSH restricted to deployer IP, HTTP/HTTPS open |
| EC2 instance | `t3.small`, Amazon Linux 2023, 20GB gp3 encrypted EBS |

### Bootstrap — what happens on first launch

The EC2 instance runs a `user_data` script on first boot that fully configures the server without any manual intervention:

1. System update and Docker installation
2. Docker Compose plugin installed manually (not available via dnf on AL2023)
3. Repository cloned from GitHub
4. Backend `.env` file written with production values
5. Full Docker Compose stack started (`docker-compose.yml` + `docker-compose.prod.yml`)
6. Script waits for backend container to be healthy (retry loop, up to 20 attempts)
7. Database migrations run
8. Database seeded with initial data

Bootstrap logs are written to `/var/log/user-data.log` on the server — check this first if anything goes wrong.

### Remote state

Terraform state is stored remotely in S3:
bucket: terraform-state-samson-2tier
key:    fleet-platform/terraform.tfstate
region: us-east-1


State is versioned — previous versions are recoverable if state is corrupted.

### Deploy from scratch

```bash
# Prerequisites: AWS CLI configured, key pair .pem available

cd infra

# Inject real secret values (file is gitignored)
./set-secrets.sh

# Initialize and apply
terraform init
terraform plan
terraform apply

# SSH into the new instance
ssh -i ~/.ssh/your-key.pem ec2-user@<ec2_public_ip>

# Watch bootstrap progress
sudo tail -f /var/log/user-data.log
```

### Tear down

```bash
cd infra
terraform destroy
```

This removes all resources cleanly. EBS volume is deleted on termination. S3 state bucket is not managed by Terraform and is not destroyed.

### Key engineering decisions

**Why S3 remote state and not local?**
Phase 5 (CI/CD) requires GitHub Actions to run Terraform commands. Local state lives on your machine — a pipeline can't access it. Remote state in S3 is a prerequisite for any automated deployment workflow, so it was set up in Phase 4 rather than migrated later.

**Why user_data and not Ansible?**
For a single server with a stable bootstrap sequence, `user_data` is the right tool. Ansible becomes worthwhile when you are configuring multiple servers or need idempotent re-runs. That complexity is not justified here.

**Why placeholders for secrets in compute.tf?**
JWT secrets and database credentials are injected locally via `infra/set-secrets.sh` before applying. The committed file contains placeholders. The production pattern for this is AWS SSM Parameter Store — the `user_data` script would fetch secrets at boot time using `aws ssm get-parameter`, keeping nothing sensitive in the codebase or Terraform state. SSM was intentionally deferred to keep Phase 4 focused on IaC fundamentals.

**Why a retry loop instead of sleep for migrations?**
A fixed `sleep` is a guess. If the backend takes longer than expected to start (slow image pull, resource contention), migrations run against a container that is not ready and fail silently. The retry loop polls the actual container health every 15 seconds for up to 5 minutes — it fails loudly if the backend never comes up rather than silently skipping migrations.
