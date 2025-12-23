include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  common       = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  environment  = "local"
  aws_region   = local.common.inputs.aws_region
  account_id   = get_env("AWS_ACCOUNT_ID", "123456789012")
  name_prefix  = "aura-local"

  tags = merge(local.common.inputs.base_tags, {
    Environment = upper(local.environment)
  })

  networking = {
    name                = local.name_prefix
    vpc_cidr            = "10.10.0.0/16"
    public_subnets      = ["10.10.0.0/20", "10.10.16.0/20"]
    private_subnets     = ["10.10.32.0/20", "10.10.48.0/20"]
    availability_zones  = ["${local.aws_region}a", "${local.aws_region}b"]
    nat_gateway_strategy = "single"
  }

  eks = {
    version = "1.29"
    node_groups = {
      system = {
        instance_types = ["t3.large"]
        desired_size   = 2
        min_size       = 1
        max_size       = 3
      }
    }
  }

  rds = {
    instance_class          = "db.t4g.medium"
    allocated_storage       = 20
    max_allocated_storage   = 100
    multi_az                = false
    deletion_protection     = false
    backup_retention_days   = 1
    enhanced_monitoring_int = 0
    username                = "auralocal"
    password_env_var        = "AURA_LOCAL_DB_PASSWORD"
  }

  redis = {
    node_type         = "cache.t4g.small"
    replica_count     = 0
    multi_az          = false
    snapshot_retention = 1
    auth_token_env_var = "AURA_LOCAL_REDIS_AUTH"
  }

  object_storage = {
    bucket_name = "aura-local-artifacts-${local.account_id}"
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
