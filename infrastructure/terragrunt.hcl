locals {
  organization = "aura"
  aws_account_id = "123456789012" # TODO: update with real account
  aws_region     = "us-east-1"
  tags = {
    "Project"     = "AURA"
    "Owner"       = "platform"
    "ManagedBy"   = "terragrunt"
    "Environment" = "${get_env("TG_ENV", "local")}" # overridden per environment
  }
}

remote_state {
  backend = "s3"
  config = {
    bucket         = "aura-terraform-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "aura-terraform-locks"
  }
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.46"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
  }
}

provider "aws" {
  region = "${local.aws_region}"
}
EOF
}
