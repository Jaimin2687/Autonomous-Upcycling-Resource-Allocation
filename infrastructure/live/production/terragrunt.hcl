include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  common       = read_terragrunt_config(find_in_parent_folders("common.hcl"))
  environment  = "production"
  aws_region   = local.common.inputs.aws_region
  account_id   = get_env("AWS_ACCOUNT_ID", "123456789012")
  name_prefix  = "aura-prod"

  tags = merge(local.common.inputs.base_tags, {
    Environment = upper(local.environment)
    Tier        = "production"
  })

  networking = {
    name                = local.name_prefix
    vpc_cidr            = "10.40.0.0/15"
    public_subnets      = ["10.40.0.0/20", "10.40.16.0/20", "10.40.32.0/20"]
    private_subnets     = ["10.40.64.0/20", "10.40.80.0/20", "10.40.96.0/20"]
    availability_zones  = ["${local.aws_region}a", "${local.aws_region}b", "${local.aws_region}c"]
    nat_gateway_strategy = "multi"
  }

  eks = {
    version = "1.29"
    node_groups = {
      system = {
        instance_types = ["m6i.large"]
        desired_size   = 4
        min_size       = 3
        max_size       = 6
      }
      workloads = {
        instance_types = ["m6i.2xlarge"]
        desired_size   = 6
        min_size       = 4
        max_size       = 10
        labels = {
          "aura.dev/pool" = "workloads"
        }
      }
      analytics = {
        instance_types = ["r6i.2xlarge"]
        desired_size   = 3
        min_size       = 2
        max_size       = 6
        labels = {
          "aura.dev/pool" = "analytics"
        }
        taints = [
          {
            key    = "aura.dev/dedicated"
            value  = "analytics"
            effect = "NO_SCHEDULE"
          }
        ]
      }
    }
  }

  rds = {
    instance_class          = "db.r6g.2xlarge"
    allocated_storage       = 500
    max_allocated_storage   = 2000
    multi_az                = true
    deletion_protection     = true
    backup_retention_days   = 14
    enhanced_monitoring_int = 60
    username                = "auraprod"
    password_env_var        = "AURA_PRODUCTION_DB_PASSWORD"
  }

  redis = {
    node_type          = "cache.r6g.xlarge"
    replica_count      = 2
    multi_az           = true
    snapshot_retention = 7
    auth_token_env_var = "AURA_PRODUCTION_REDIS_AUTH"
  }

  object_storage = {
    bucket_name = "aura-production-artifacts-${local.account_id}"
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
