# Security Group
resource "aws_security_group" "fleet_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for fleet platform EC2"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from my IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-sg"
    Environment = var.environment
  }
}

# EC2 Instance
resource "aws_instance" "fleet_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.fleet_sg.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = <<-USERDATA
    #!/bin/bash
    set -e
    exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

    echo "=== Starting Fleet Platform Bootstrap ==="

    # System update and dependencies
    dnf update -y
    dnf install -y docker git

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user

    # Install Docker Compose plugin
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-linux-x86_64 \
      -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    # Clone the repository
    cd /home/ec2-user
    git clone https://github.com/Reich-imperial/fleet-platform.git
    cd fleet-platform

    # Write backend .env file
    cat > backend/.env << 'ENVFILE'
NODE_ENV=production
PORT=3000
DATABASE_URL=REPLACE_WITH_DATABASE_URL
DB_POOL_MAX=10
REDIS_URL=redis://redis:6379
JWT_SECRET=REPLACE_WITH_JWT_SECRET
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=REPLACE_WITH_JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=*
ENVFILE

    # Fix ownership so ec2-user owns everything
    chown -R ec2-user:ec2-user /home/ec2-user/fleet-platform

    # Start the stack as ec2-user
    sudo -u ec2-user docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

    # Wait for backend to be healthy before running migrations
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

    # Run migrations and seed
    echo "=== Running migrations ==="
    sudo -u ec2-user docker compose exec -T backend npm run migrate

    echo "=== Running seed ==="
    sudo -u ec2-user docker compose exec -T backend npm run seed

    echo "=== Fleet Platform Bootstrap Complete ==="
  USERDATA

  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
  }
}
