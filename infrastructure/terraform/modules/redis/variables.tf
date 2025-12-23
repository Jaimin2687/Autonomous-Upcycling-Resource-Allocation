variable "name" {
  description = "Replication group identifier."
  type        = string
}

variable "description" {
  description = "Description for the replication group."
  type        = string
  default     = "Aura application cache"
}

variable "vpc_id" {
  description = "VPC hosting the cache cluster."
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for the cache subnet group."
  type        = list(string)
}

variable "allowed_security_groups" {
  description = "Security groups allowed ingress."
  type        = list(string)
  default     = []
}

variable "allowed_cidr_blocks" {
  description = "CIDR ranges allowed ingress."
  type        = list(string)
  default     = []
}

variable "port" {
  description = "Port for Redis."
  type        = number
  default     = 6379
}

variable "parameter_family" {
  description = "ElastiCache parameter group family (e.g., redis7)."
  type        = string
  default     = "redis7"
}

variable "parameters" {
  description = "Custom parameter overrides."
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "node_type" {
  description = "Instance class for cache nodes."
  type        = string
  default     = "cache.r6g.large"
}

variable "engine_version" {
  description = "Redis engine version."
  type        = string
  default     = "7.1"
}

variable "auth_token" {
  description = "Auth token for Redis (required when transit encryption enabled)."
  type        = string
  sensitive   = true
}

variable "multi_az" {
  description = "Enable multi-AZ with automatic failover."
  type        = bool
  default     = true
}

variable "replica_count" {
  description = "Number of replicas per node group."
  type        = number
  default     = 1
}

variable "snapshot_retention_days" {
  description = "Snapshot retention period."
  type        = number
  default     = 3
}

variable "snapshot_window" {
  description = "Daily time range for taking snapshots."
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Weekly maintenance window."
  type        = string
  default     = "sun:05:00-sun:06:00"
}

variable "notification_topic_arn" {
  description = "SNS topic ARN for notifications."
  type        = string
  default     = null
}

variable "apply_immediately" {
  description = "Apply updates immediately."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Resource tags."
  type        = map(string)
  default     = {}
}
