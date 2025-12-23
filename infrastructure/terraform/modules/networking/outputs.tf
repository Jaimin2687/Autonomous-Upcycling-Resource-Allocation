output "vpc_id" {
  description = "ID of the created VPC."
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets."
  value       = [for subnet in aws_subnet.private : subnet.id]
}

output "vpc_cidr_block" {
  description = "CIDR block associated with the VPC."
  value       = aws_vpc.this.cidr_block
}

output "private_route_table_ids" {
  description = "Route table IDs for private subnets."
  value       = [for rt in aws_route_table.private : rt.id]
}

output "public_route_table_id" {
  description = "Route table ID for public subnets."
  value       = aws_route_table.public.id
}
