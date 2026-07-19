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
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = base64encode(templatefile("${path.module}/bootstrap.sh", {
    jwt_secret         = "35b20aa5a41efc496a6b4123231f2206e6845908b63dcb74e2be5084b836c25209577e24045daf1f817b7e64d932f8a0127ff5687303f07fe943b693545f2b8f"
    jwt_refresh_secret = "c155273e8f3a63a0a16cd8c18351a399b64c698f83b07396029e13668c24785fda128bb5c40087f825ebe8b2f58b4206bf7c5990a0897ab4f613b360b5628e12"
    database_url       = "postgresql://fleet_user:fleet_pass@postgres:5432/fleet_db"
  }))

  lifecycle {
    ignore_changes = [user_data]
  }

  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
  }
}

# IAM role for EC2 to pull from ECR
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = {
    Name        = "${var.project_name}-ec2-role"
    Environment = var.environment
  }
}

# Attach ECR read policy to the role
resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Instance profile wraps the role so EC2 can use it
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}
