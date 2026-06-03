terraform {
  backend "s3" {
    bucket = "terraform-state-samson-2tier"
    key    = "fleet-platform/terraform.tfstate"
    region = "us-east-1"
  }
}
