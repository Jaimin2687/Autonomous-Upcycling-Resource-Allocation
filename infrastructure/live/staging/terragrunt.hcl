include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  common       = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  environment  = "staging"
  aws_region   = local.common.inputs.aws_region
  account_id   = get_env("AWS_ACCOUNT_ID", "123456789012")
  name_prefix  = "aura-stg"

  tags = merge(local.common.inputs.base_tags, {
    Environment = upper(local.environment)
  })

  networking = {
    name                = local.name_prefix
    vpc_cidr            = "10.30.0.0/16"
    public_subnets      = ["10.30.0.0/20", "10.30.16.0/20", "10.30.32.0/20"]
    private_subnets     = ["10.30.64.0/20", "10.30.80.0/20", "10.30.96.0/20"]
    availability_zones  = ["${local.aws_region}a", "${local.aws_region}b", "${local.aws_region}c"]
    nat_gateway_strategy = "multi"
  }

  eks = {
    version = "1.29"
    node_groups = {
      system = {
        instance_types = ["m6i.large"]
        desired_size   = 3
        min_size       = 2
        max_size       = 4
      }
      workloads = {
        instance_types = ["m6i.xlarge"]
        desired_size   = 4
        min_size       = 3
        max_size       = 6
        labels = {
          "aura.dev/pool" = "workloads"
        }
      }
    }
  }

  rds = {
    instance_class          = "db.m6g.xlarge"
    allocated_storage       = 200
    max_allocated_storage   = 500
    multi_az                = true
    deletion_protection     = true
    backup_retention_days   = 7
    enhanced_monitoring_int = 60
    username                = "aurastg"
    password_env_var        = "AURA_STAGING_DB_PASSWORD"
  }

  redis = {
    node_type          = "cache.r6g.large"
    replica_count      = 2
    multi_az           = true
    snapshot_retention = 5
    auth_token_env_var = "AURA_STAGING_REDIS_AUTH"
  }

  object_storage = {
    bucket_name = "aura-staging-artifacts-${local.account_id}"
  }

  secrets = {
    name = "aura/${local.environment}/app"
  }

  observability = {
    namespace = "observability"
  }
}

inputs = merge(local.common.inputs, {
  environment = local.environment
  aws_region  = local.aws_region
  tags        = local.tags
  name_prefix = local.name_prefix
})
