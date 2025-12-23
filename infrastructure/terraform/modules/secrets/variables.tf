variable "name" {
  description = "Name of the secret."
  type        = string
}

variable "description" {
  description = "Description of the secret."
  type        = string
  default     = "Managed by Terraform"
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption."
  type        = string
  default     = null
}

variable "initial_secret_value" {
  description = "Optional initial secret value."
  type        = string
  default     = null
  sensitive   = true
}

variable "rotation_lambda_arn" {
  description = "ARN of the Lambda function handling secret rotation."
  type        = string
  default     = null
}

variable "rotation_interval_days" {
  description = "Number of days between secret rotations."
  type        = number
  default     = 30
}

variable "recovery_window_in_days" {
  description = "Number of days to retain the secret during scheduled deletion."
  type        = number
  default     = 30
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}
