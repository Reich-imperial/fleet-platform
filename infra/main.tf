# Root Terraform config
# TODO: implement in Phase 4 after manual AWS setup is working
#
# Resources to eventually define:
#   - VPC + subnets + internet gateway
#   - Security groups
#   - EC2 instance (or ECS)
#   - RDS PostgreSQL
#   - ElastiCache Redis
#   - ALB (Phase 6)

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # TODO: configure S3 backend for state storage
  # backend "s3" { ... }
}

provider "aws" {
  region = var.aws_region
}
