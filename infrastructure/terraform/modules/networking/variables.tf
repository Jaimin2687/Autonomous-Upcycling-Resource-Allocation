variable "name" {
  description = "Prefix used for resource naming."
  type        = string
}

variable "region" {
  description = "AWS region (used for endpoints)."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets keyed by index."
  type        = list(string)
  validation {
    condition     = length(var.public_subnets) > 0
    error_message = "At least one public subnet is required."
  }
}

variable "private_subnets" {
  description = "CIDR blocks for private subnets keyed by index."
  type        = list(string)
  validation {
    condition     = length(var.private_subnets) > 0
    error_message = "At least one private subnet is required."
  }
}

variable "availability_zones" {
  description = "Availability zones corresponding to subnets."
  type        = list(string)
}

variable "nat_gateway_strategy" {
  description = "Strategy for NAT gateway provisioning: single or multi."
  type        = string
  default     = "single"
  validation {
    condition     = contains(["single", "multi"], var.nat_gateway_strategy)
    error_message = "nat_gateway_strategy must be either 'single' or 'multi'."
  }
}

variable "enable_ipv6" {
  description = "Whether to allocate an IPv6 block for the VPC."
  type        = bool
  default     = false
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC flow logs to CloudWatch."
  type        = bool
  default     = true
}

variable "flow_log_retention_days" {
  description = "Retention for VPC flow logs."
  type        = number
  default     = 30
}

variable "kms_key_arn" {
  description = "Optional KMS key ARN for encrypting CloudWatch log groups."
  type        = string
  default     = null
}

variable "create_s3_endpoint" {
  description = "Create a gateway endpoint for Amazon S3."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags to apply to resources."
  type        = map(string)
  default     = {}
}
