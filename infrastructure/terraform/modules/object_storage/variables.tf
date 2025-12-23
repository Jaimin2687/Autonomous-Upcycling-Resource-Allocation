variable "bucket_name" {
  description = "Name of the S3 bucket."
  type        = string
}

variable "enable_versioning" {
  description = "Enable versioning on the bucket."
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "Optional KMS key ARN for bucket encryption."
  type        = string
  default     = null
}

variable "lifecycle_rules" {
  description = "Lifecycle rules for the bucket."
  type = list(object({
    id     = string
    status = string
    prefix = optional(string)
    transitions = optional(list(object({
      days          = number
      storage_class = string
    })))
    expiration = optional(list(object({
      days = number
    })))
  }))
  default = []
}

variable "access_logging" {
  description = "Access logging configuration."
  type = object({
    target_bucket = string
    target_prefix = string
  })
  default = null
}

variable "enable_object_lock" {
  description = "Enable object lock (must be enabled on bucket creation)."
  type        = bool
  default     = false
}

variable "force_destroy" {
  description = "Allow bucket to be destroyed even when non-empty (use with caution)."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common resource tags."
  type        = map(string)
  default     = {}
}
