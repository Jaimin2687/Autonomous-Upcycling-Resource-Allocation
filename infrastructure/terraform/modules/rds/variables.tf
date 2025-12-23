variable "name" {
  description = "Identifier prefix for the database."
  type        = string
}

variable "vpc_id" {
  description = "Target VPC ID."
  type        = string
}

variable "subnet_ids" {
  description = "Private subnet IDs for the database subnet group."
  type        = list(string)
}

variable "allowed_security_groups" {
  description = "Security groups allowed to access the database."
  type        = list(string)
  default     = []
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the database."
  type        = list(string)
  default     = []
}

variable "parameter_family" {
  description = "Parameter group family (e.g., postgres14)."
  type        = string
  default     = "postgres15"
}

variable "parameters" {
  description = "List of parameter overrides for the database parameter group."
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "engine_version" {
  description = "PostgreSQL engine version."
  type        = string
  default     = "15.5"
}

variable "instance_class" {
  description = "Instance class for the database."
  type        = string
  default     = "db.r6g.large"
}

variable "allocated_storage" {
  description = "Initial storage in GB."
  type        = number
  default     = 100
}

variable "max_allocated_storage" {
  description = "Maximum storage for autoscaling in GB."
  type        = number
  default     = 500
}

variable "kms_key_arn" {
  description = "KMS key ARN used for encryption."
  type        = string
  default     = null
}

variable "username" {
  description = "Master username."
  type        = string
}

variable "password" {
  description = "Master password. Store securely and provide via Terragrunt/TF Cloud variables."
  type        = string
  sensitive   = true
}

variable "port" {
  description = "Database port."
  type        = number
  default     = 5432
}

variable "multi_az" {
  description = "Enable Multi-AZ deployments."
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups."
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection for production workloads."
  type        = bool
  default     = true
}

variable "final_snapshot_on_delete" {
  description = "Create a final snapshot before deletion."
  type        = bool
  default     = true
}

variable "maintenance_window" {
  description = "Preferred maintenance window."
  type        = string
  default     = "Mon:03:00-Mon:04:00"
}

variable "backup_window" {
  description = "Preferred backup window."
  type        = string
  default     = "02:00-03:00"
}

variable "enhanced_monitoring_interval" {
  description = "Interval for enhanced monitoring in seconds (0 disables)."
  type        = number
  default     = 60
}

variable "monitoring_role_arn" {
  description = "IAM role ARN for RDS enhanced monitoring."
  type        = string
  default     = null
}

variable "apply_immediately" {
  description = "Apply modifications immediately instead of during the next maintenance window."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common resource tags."
  type        = map(string)
  default     = {}
}
