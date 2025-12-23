variable "name" {
  description = "EKS cluster name prefix."
  type        = string
}

variable "environment" {
  description = "Deployment environment name (e.g., dev, staging)."
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC to deploy the cluster into."
  type        = string
}

variable "subnet_ids" {
  description = "Subnets available to the control plane (public + private)."
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for worker nodes."
  type        = list(string)
}

variable "kubernetes_version" {
  description = "Desired Kubernetes version for the control plane."
  type        = string
  default     = "1.29"
}

variable "node_groups" {
  description = "Map of managed node group configurations."
  type = map(object({
    subnet_ids         = optional(list(string))
    instance_types     = optional(list(string))
    ami_type           = optional(string)
    disk_size          = optional(number)
    desired_size       = optional(number)
    min_size           = optional(number)
    max_size           = optional(number)
    capacity_type      = optional(string)
    kubernetes_version = optional(string)
    labels             = optional(map(string))
    taints = optional(list(object({
      key    = string
      value  = string
      effect = string
    })))
    release_version = optional(string)
    max_unavailable = optional(number)
  }))
  default = {
    system = {
      instance_types = ["m6i.large"]
      desired_size   = 3
      min_size       = 2
      max_size       = 5
      labels = {
        "aura.dev/pool" = "system"
      }
    }
  }
}

variable "endpoint_public_access" {
  description = "Whether the EKS API server endpoint is publicly reachable."
  type        = bool
  default     = false
}

variable "endpoint_private_access" {
  description = "Whether the EKS API server endpoint is reachable through the VPC."
  type        = bool
  default     = true
}

variable "endpoint_public_access_cidrs" {
  description = "CIDR blocks allowed to access the public endpoint."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enabled_control_plane_logs" {
  description = "List of control plane log types to enable."
  type        = list(string)
  default     = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
}

variable "control_plane_log_retention_days" {
  description = "Retention period for control plane logs."
  type        = number
  default     = 30
}

variable "kms_key_arn" {
  description = "Optional KMS key ARN used to encrypt CloudWatch logs."
  type        = string
  default     = null
}

variable "tags" {
  description = "Common tags applied to resources."
  type        = map(string)
  default     = {}
}
