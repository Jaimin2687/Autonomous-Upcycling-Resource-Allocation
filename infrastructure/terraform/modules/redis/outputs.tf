output "primary_endpoint" {
  description = "Primary endpoint address for Redis."
  value       = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "reader_endpoint" {
  description = "Reader endpoint address for Redis."
  value       = aws_elasticache_replication_group.this.reader_endpoint_address
}

output "port" {
  description = "Port Redis listens on."
  value       = aws_elasticache_replication_group.this.port
}

output "security_group_id" {
  description = "Security group associated with the cache."
  value       = aws_security_group.this.id
}
