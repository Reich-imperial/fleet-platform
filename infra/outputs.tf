output "ec2_public_ip" {
  description = "Public IP of the fleet platform EC2 instance"
  value       = aws_instance.fleet_server.public_ip
}

output "ec2_instance_id" {
  description = "Instance ID of the fleet platform EC2"
  value       = aws_instance.fleet_server.id
}

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}
