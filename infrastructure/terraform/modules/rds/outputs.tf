output "endpoint" {
  description = "Writer endpoint for the RDS instance."
  value       = aws_db_instance.this.endpoint
}

output "port" {
  description = "Port the database listens on."
  value       = aws_db_instance.this.port
}

output "security_group_id" {
  description = "Security group protecting the database."
  value       = aws_security_group.this.id
}

output "arn" {
  description = "ARN of the RDS instance."
  value       = aws_db_instance.this.arn
}

output "identifier" {
  description = "Identifier of the RDS instance."
  value       = aws_db_instance.this.id
}
