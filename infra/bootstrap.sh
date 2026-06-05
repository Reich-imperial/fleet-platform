#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Starting Fleet Platform Bootstrap ==="

dnf update -y
dnf install -y docker git aws-cli

systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

cd /home/ec2-user
git clone https://github.com/Reich-imperial/fleet-platform.git
cd fleet-platform

cat > backend/.env << ENVFILE
NODE_ENV=production
PORT=3000
DATABASE_URL=${database_url}
DB_POOL_MAX=10
REDIS_URL=redis://redis:6379
JWT_SECRET=${jwt_secret}
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=${jwt_refresh_secret}
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=*
ENVFILE

chown -R ec2-user:ec2-user /home/ec2-user/fleet-platform

aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  956867427400.dkr.ecr.us-east-1.amazonaws.com

sudo -u ec2-user docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  -f docker-compose.ecr.yml \
  -f docker-compose.monitoring.yml up -d

echo "=== Waiting for backend to be ready ==="
RETRIES=20
COUNT=0
until sudo -u ec2-user docker compose exec -T backend node -e "console.log('ok')" > /dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $RETRIES ]; then
    echo "Backend did not become ready in time. Skipping migrations."
    exit 1
  fi
  echo "Waiting for backend... attempt $COUNT/$RETRIES"
  sleep 15
done

echo "=== Running migrations ==="
sudo -u ec2-user docker compose exec -T backend npm run migrate

echo "=== Running seed ==="
sudo -u ec2-user docker compose exec -T backend npm run seed

echo "=== Fleet Platform Bootstrap Complete ==="
