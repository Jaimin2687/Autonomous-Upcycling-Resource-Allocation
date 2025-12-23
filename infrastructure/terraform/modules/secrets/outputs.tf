output "secret_arn" {
  description = "ARN of the secret."
  value       = aws_secretsmanager_secret.this.arn
}

output "secret_name" {
  description = "Name of the secret."
  value       = aws_secretsmanager_secret.this.name
}

output "version_id" {
  description = "Version ID of the current secret (if created)."
  value       = try(aws_secretsmanager_secret_version.this[0].version_id, null)
}
