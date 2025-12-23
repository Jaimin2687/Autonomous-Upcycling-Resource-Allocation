include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  parent   = read_terragrunt_config(find_in_parent_folders())
  tags     = local.parent.inputs.tags
  rds_conf = local.parent.locals.rds
}

dependency "networking" {
  config_path = "../networking"
}

dependency "eks" {
  config_path = "../eks"
}

terraform {
  source = "../../../terraform/modules/rds"
}

inputs = {
  name                    = "${local.parent.inputs.name_prefix}-db"
  vpc_id                  = dependency.networking.outputs.vpc_id
  subnet_ids              = dependency.networking.outputs.private_subnet_ids
  allowed_security_groups = [dependency.eks.outputs.node_security_group_id]
  allowed_cidr_blocks     = try(local.rds_conf.allowed_cidr_blocks, [])
  parameter_family        = try(local.rds_conf.parameter_family, "postgres15")
  parameters              = try(local.rds_conf.parameters, [])
  engine_version          = try(local.rds_conf.engine_version, "15.5")
  instance_class          = try(local.rds_conf.instance_class, "db.r6g.2xlarge")
  allocated_storage       = try(local.rds_conf.allocated_storage, 500)
  max_allocated_storage   = try(local.rds_conf.max_allocated_storage, 2000)
  kms_key_arn             = try(local.rds_conf.kms_key_arn, null)
  username                = local.rds_conf.username
  password                = get_env(local.rds_conf.password_env_var, "")
  port                    = try(local.rds_conf.port, 5432)
  multi_az                = try(local.rds_conf.multi_az, true)
  backup_retention_days   = try(local.rds_conf.backup_retention_days, 14)
  deletion_protection     = try(local.rds_conf.deletion_protection, true)
  final_snapshot_on_delete = try(local.rds_conf.final_snapshot_on_delete, true)
  maintenance_window      = try(local.rds_conf.maintenance_window, "Mon:03:00-Mon:04:00")
  backup_window           = try(local.rds_conf.backup_window, "02:00-03:00")
  enhanced_monitoring_interval = try(local.rds_conf.enhanced_monitoring_int, 60)
  monitoring_role_arn     = try(local.rds_conf.monitoring_role_arn, null)
  apply_immediately       = try(local.rds_conf.apply_immediately, false)
  tags                    = local.tags
}
