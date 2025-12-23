include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  parent      = read_terragrunt_config(find_in_parent_folders())
  tags        = local.parent.inputs.tags
  secret_conf = local.parent.locals.secrets
}

terraform {
  source = "../../../terraform/modules/secrets"
}

inputs = {
  name                   = local.secret_conf.name
  description            = try(local.secret_conf.description, "Managed by Terraform")
  kms_key_arn            = try(local.secret_conf.kms_key_arn, null)
  initial_secret_value   = try(local.secret_conf.initial_secret_value, null)
  rotation_lambda_arn    = try(local.secret_conf.rotation_lambda_arn, null)
  rotation_interval_days = try(local.secret_conf.rotation_interval_days, 30)
  recovery_window_in_days = try(local.secret_conf.recovery_window_in_days, 30)
  tags                   = local.tags
}
