include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  parent      = read_terragrunt_config(find_in_parent_folders())
  tags        = local.parent.inputs.tags
  object_conf = local.parent.locals.object_storage
}

terraform {
  source = "../../../terraform/modules/object_storage"
}

inputs = {
  bucket_name        = local.object_conf.bucket_name
  enable_versioning  = try(local.object_conf.enable_versioning, true)
  kms_key_arn        = try(local.object_conf.kms_key_arn, null)
  lifecycle_rules    = try(local.object_conf.lifecycle_rules, [])
  access_logging     = try(local.object_conf.access_logging, null)
  enable_object_lock = try(local.object_conf.enable_object_lock, false)
  force_destroy      = try(local.object_conf.force_destroy, false)
  tags               = local.tags
}
