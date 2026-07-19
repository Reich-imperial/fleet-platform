# Fleet Management Platform

![Status](https://img.shields.io/badge/status-active--development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

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

![FleetOps operations dashboard showing active trips, fleet overview, and maintenance alerts](./docs/screenshots/dashboard.png)

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
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana + Node Exporter + cAdvisor |

---

## Architecture

![System architecture diagram: browser to Nginx reverse proxy to React frontend and Express backend to PostgreSQL and Redis](./docs/screenshots/architecture.png)

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
│   │   └── hooks/           # Custom React hooks
│   └── nginx.conf           # SPA fallback config for React Router
├── nginx/
│   └── nginx.conf           # Reverse proxy config
├── infra/                   # Terraform (Phase 4)
├── monitoring/              # Prometheus + Grafana (Phase 6)
├── docker-compose.yml       # Base Compose config
├── docker-compose.prod.yml  # Production overrides
├── docker-compose.ecr.yml   # AWS ECR overrides [optional]
└── docker-compose.monitoring.yml  # Monitoring overrides
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

## Infrastructure (Phase 4 — Terraform)

All AWS infrastructure is defined as code in `/infra`. A single `terraform apply` provisions the complete environment with zero manual steps.

### What Terraform creates

| Resource | Configuration |
|---|---|
| VPC | `10.0.0.0/16`, DNS support and hostnames enabled |
| Public subnet | `10.0.1.0/24` in `us-east-1a`, auto-assign public IP |
| Internet gateway | Attached to VPC |
| Route table | `0.0.0.0/0 → IGW`, associated to public subnet |
| Security group | SSH open, HTTP/HTTPS open |
| EC2 instance | `t3.small`, Amazon Linux 2023, 20GB gp3 encrypted EBS |
| IAM instance profile | Allows EC2 to authenticate to ECR without hardcoded credentials |

### Bootstrap — what happens on first launch

The EC2 runs `infra/bootstrap.sh` via `user_data` on first boot. Zero manual steps after `terraform apply`:

1. System update, Docker and AWS CLI installation
2. Docker Compose plugin installed manually — not available via dnf on AL2023
3. Repository cloned from GitHub
4. Backend `.env` written with production values via Terraform `templatefile()`
5. ECR authentication — server uses IAM instance profile to pull images
6. Full stack started — `docker-compose.yml` + `docker-compose.prod.yml` + `docker-compose.ecr.yml` + `docker-compose.monitoring.yml`
7. Retry loop waits for backend container to be healthy — 20 attempts, 15 seconds apart
8. Migrations run
9. Database seeded

Bootstrap logs at `/var/log/user-data.log` — check here first if anything goes wrong.

### What broke during Phase 4

**Nested heredoc broke cloud-init**
The original `user_data` used an inline heredoc with a nested `ENVFILE` heredoc inside it. Cloud-init silently dropped the entire script — the server booted clean with nothing installed. No error, no log, just a bare server.

Fix: moved bootstrap to `infra/bootstrap.sh` and referenced it with `templatefile()`:

```hcl
user_data = base64encode(templatefile("${path.module}/bootstrap.sh", {
  jwt_secret         = "..."
  jwt_refresh_secret = "..."
  database_url       = "..."
}))
```

**`sleep 30` was a guess**
The original migration step waited 30 seconds then ran migrations regardless of whether the backend was ready. If the backend was crash-looping, migrations ran against a dead container and failed silently.

Fix: retry loop that actually checks container health:

```bash
until docker compose exec -T backend node -e "console.log('ok')" > /dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  [ $COUNT -ge $RETRIES ] && exit 1
  sleep 15
done
```

**Secrets in Terraform files**
JWT secrets and database credentials cannot be committed to git. Fix: `infra/set-secrets.sh` (gitignored) injects real values before apply. Committed file has placeholders.

Production pattern: AWS SSM Parameter Store — `user_data` fetches secrets at boot via `aws ssm get-parameter`. Deferred to keep Phase 4 focused.

### Remote state
bucket: terraform-state-samson-2tier
key:    fleet-platform/terraform.tfstate
region: us-east-1

State is versioned — previous versions recoverable if corrupted.

### Deploy from scratch

```bash
cd infra
./set-secrets.sh          # inject real secrets (gitignored)
terraform init
terraform plan
terraform apply
ssh -i ~/.ssh/your-key.pem ec2-user@<ec2_public_ip>
sudo tail -f /var/log/user-data.log
```

### Tear down

```bash
cd infra && terraform destroy
```

EBS volume deleted on termination. S3 state bucket is unmanaged and not destroyed.

---

## CI/CD (Phase 5 — GitHub Actions)

Every push to `main` builds and deploys automatically.

![GitHub Actions run showing Build and Push to ECR and Deploy to EC2 jobs both succeeding in 47s](./docs/screenshots/ci-pipeline-run.png)

*A live pipeline run — build and deploy jobs completing in under a minute on a push to `main`.*

![Amazon ECR repository showing frontend and backend images tagged and pushed](./docs/screenshots/ecr-images.png)

### Pipeline flow
Push to main
↓
Build job
→ Build backend Docker image
→ Build frontend Docker image
→ Tag with commit SHA + latest
→ Push both to Amazon ECR
↓
Deploy job
→ Query AWS for running EC2 by tag name (no hardcoded IP)
→ SSH into server
→ git pull origin main (sync new files)
→ Pull new images from ECR
→ Restart full stack
→ Run migrations

### IAM least privilege

Pipeline uses a dedicated IAM user `fleet-github-actions` with only the permissions it needs:
- `ecr:GetAuthorizationToken`
- ECR push permissions scoped to the `fleet-platform` repository only
- `ec2:DescribeInstances` to discover the server by tag

Not admin. Not power user. Exactly what the pipeline needs.

### EC2 discovery

The pipeline never hardcodes the server IP. Every `terraform apply` gives a new IP. The pipeline queries AWS by tag:

```bash
IP=$(aws ec2 describe-instances   --filters     "Name=tag:Name,Values=fleet-platform-server"     "Name=instance-state-name,Values=running"   --query "Reservations[0].Instances[0].PublicIpAddress"   --output text)
```

If no running instance is found, the deploy job fails with a clear message: `No running EC2 instance found. Run terraform apply first.`

### What broke during Phase 5

**SSH key formatting corrupted by GitHub UI**
Pasting the private key into the GitHub Secrets web interface stripped newlines. The pipeline could not parse it.

Fix: used GitHub CLI to set the secret directly from the file:
```bash
gh secret set EC2_SSH_KEY < ~/.ssh/microsvc.pem
```

**Port 22 blocked for GitHub Actions runners**
Security group restricted SSH to my IP only. GitHub Actions runs from GitHub's own IP ranges — completely different. Pipeline timed out on every SSH attempt.

Fix: opened port 22 to `0.0.0.0/0`. Security comes from the key pair. Production alternative: AWS Systems Manager Session Manager — no SSH port needed at all.

**EC2 had no ECR permissions**
The server could not authenticate to ECR to pull images. Fix: IAM instance profile with `AmazonEC2ContainerRegistryReadOnly` attached to the EC2. Server authenticates via its role — no credentials anywhere.

**`terraform apply` wanted to replace the EC2**
Adding the IAM instance profile changed the EC2 resource. Terraform planned to destroy and recreate the server, wiping the database volumes.

Fix: lifecycle block to ignore user_data changes on existing instances:
```hcl
lifecycle {
  ignore_changes = [user_data]
}
```

**New files never reached the server**
The deploy script pulled Docker images from ECR but never ran `git pull`. Files like `docker-compose.monitoring.yml` existed in the repo but never appeared on the server.

Fix: added `git pull origin main` to the deploy script before `docker compose up`.

### Targeted service restarts

Not every backend change needs a full pipeline run. For quick logic changes during active development, a single service can be rebuilt and restarted directly on the server without touching the rest of the stack:

![Terminal showing fleet-platform-backend-1 exited then restarted via docker compose up -d backend, with Redis and Postgres remaining healthy throughout](./docs/screenshots/backend-restart.png)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend
```

Only the backend container restarts — Redis, Postgres, Nginx, and the frontend stay up the whole time. This is a manual fast-path for iterating on backend logic; the GitHub Actions pipeline above is still the path for anything that should actually ship to `main`.

### What is not fully automated

`terraform apply` remains manual. Automating infrastructure provisioning in the same pipeline as application deploys risks destroying database volumes on a bad push. Separating infrastructure changes (deliberate, manual) from application deploys (automatic, every push) is intentional.

Production pattern: Terraform Cloud or Atlantis with approval gates and automated state snapshots before every apply.

### GitHub Secrets required

| Secret | Purpose |
|---|---|
| `AWS_ACCESS_KEY_ID` | Pipeline AWS authentication |
| `AWS_SECRET_ACCESS_KEY` | Pipeline AWS authentication |
| `EC2_SSH_KEY` | SSH into EC2 for deploy |
| `EC2_USER` | SSH username (`ec2-user`) |

---

## Monitoring (Phase 6 — Prometheus + Grafana)

Four additional containers in `docker-compose.monitoring.yml`:

| Container | Purpose |
|---|---|
| Prometheus | Scrapes and stores metrics every 15 seconds |
| Grafana | Visualizes metrics as dashboards |
| Node Exporter | Exposes EC2 host metrics — CPU, memory, disk, network |
| cAdvisor | Exposes per-container metrics |

![Grafana cAdvisor dashboard showing per-container network traffic and container metadata for the fleet platform stack](./docs/screenshots/grafana-monitoring.png)

cAdvisor covers per-container resource usage. Node Exporter covers the host itself — CPU, RAM, disk, and uptime for the underlying EC2 instance:

![Node Exporter Full dashboard showing host-level CPU, RAM, disk, and network metrics](./docs/screenshots/node-exporter-dashboard.png)

Together, the two dashboards answer different questions: cAdvisor shows which container is consuming resources, Node Exporter shows whether the host itself is under pressure.

### Accessing Grafana

Grafana is not exposed to the public internet. Access via SSH tunnel:

```bash
ssh -i ~/.ssh/your-key.pem -L 3001:localhost:3001 ec2-user@<ec2_public_ip> -N
```

Then open `http://localhost:3001` in your browser.

Default credentials: `admin` / `fleet_grafana_2024`

**Why SSH tunnel and not public access?**
Grafana exposes infrastructure internals — CPU patterns, memory usage, container names. Exposing this publicly creates both an information leak and an attack surface. The SSH tunnel gives secure access without opening any additional ports.

Production alternatives: VPN access or Grafana Cloud.

### Baseline metrics on t3.small running 9 containers

| Metric | Value |
|---|---|
| CPU at idle | 1.6% |
| RAM used | 44.8% |
| Disk used | 6.2% |

Per-container breakdown: Grafana and Prometheus are the heaviest memory consumers. cAdvisor uses the most CPU — it continuously inspects all running containers.

### What is not monitored yet

The backend has no `/metrics` endpoint. Prometheus cannot scrape application-level metrics — request rate, response times, error rates. Adding a Prometheus client library to the Node.js app and exposing a `/metrics` route is the next observability layer.

Infrastructure metrics tell you the server is struggling. Application metrics tell you why.

---

## Related projects
[`k8s-learning`](https://github.com/Reich-imperial/k8s-learning) — this same application deployed to Kubernetes: Helm chart, EKS-specific values, AWS Load Balancer Controller with IRSA, and the EBS CSI driver.

[`fleet-gitops`](https://github.com/Reich-imperial/fleet-app) — the next chapter for this platform: taking the same application to Kubernetes with ArgoCD-driven GitOps deployment, namespace-level multi-tenancy, and CI security gating (SonarCloud, Snyk, Trivy). *(in progress)*

---

## Author

Samson Ayodele — DevOps / Cloud Engineering
GitHub: [github.com/Reich-imperial](https://github.com/Reich-imperial)
Portfolio: [me.helixn8n.cfd](https://me.helixn8n.cfd)
LinkedIn: [linkedin.com/in/samson-olanipekun-devops](https://linkedin.com/in/samson-olanipekun-devops)
