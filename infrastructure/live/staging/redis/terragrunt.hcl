include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  parent     = read_terragrunt_config(find_in_parent_folders())
  tags       = local.parent.inputs.tags
  redis_conf = local.parent.locals.redis
}

dependency "networking" {
  config_path = "../networking"
}

dependency "eks" {
  config_path = "../eks"
}

terraform {
  source = "../../../terraform/modules/redis"
}

inputs = {
  name                    = "${local.parent.inputs.name_prefix}-redis"
  vpc_id                  = dependency.networking.outputs.vpc_id
  subnet_ids              = dependency.networking.outputs.private_subnet_ids
  allowed_security_groups = [dependency.eks.outputs.node_security_group_id]
  allowed_cidr_blocks     = try(local.redis_conf.allowed_cidr_blocks, [])
  port                    = try(local.redis_conf.port, 6379)
  parameter_family        = try(local.redis_conf.parameter_family, "redis7")
  parameters              = try(local.redis_conf.parameters, [])
  node_type               = try(local.redis_conf.node_type, "cache.r6g.large")
  engine_version          = try(local.redis_conf.engine_version, "7.1")
  auth_token              = get_env(local.redis_conf.auth_token_env_var, "")
  multi_az                = try(local.redis_conf.multi_az, true)
  replica_count           = try(local.redis_conf.replica_count, 2)
  snapshot_retention_days = try(local.redis_conf.snapshot_retention, 5)
  snapshot_window         = try(local.redis_conf.snapshot_window, "03:00-04:00")
  maintenance_window      = try(local.redis_conf.maintenance_window, "sun:05:00-sun:06:00")
  notification_topic_arn  = try(local.redis_conf.notification_topic_arn, null)
  apply_immediately       = try(local.redis_conf.apply_immediately, false)
  tags                    = local.tags
}
