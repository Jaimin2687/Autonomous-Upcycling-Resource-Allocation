include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  parent      = read_terragrunt_config(find_in_parent_folders())
  tags        = local.parent.inputs.tags
  eks_config  = local.parent.locals.eks
  env_name    = local.parent.inputs.environment
  endpoint_public_access       = try(local.eks_config.endpoint_public_access, local.env_name != "production")
  endpoint_public_access_cidrs = try(local.eks_config.endpoint_public_access_cidrs, ["0.0.0.0/0"])
}

dependency "networking" {
  config_path = "../networking"
}

terraform {
  source = "../../../terraform/modules/eks"
}

inputs = {
  name                       = "${local.parent.inputs.name_prefix}-eks"
  environment                = local.env_name
  vpc_id                     = dependency.networking.outputs.vpc_id
  subnet_ids                 = concat(
    dependency.networking.outputs.public_subnet_ids,
    dependency.networking.outputs.private_subnet_ids,
  )
  private_subnet_ids         = dependency.networking.outputs.private_subnet_ids
  kubernetes_version         = try(local.eks_config.version, null)
  node_groups                = try(local.eks_config.node_groups, {})
  endpoint_public_access     = local.endpoint_public_access
  endpoint_private_access    = true
  endpoint_public_access_cidrs = local.endpoint_public_access_cidrs
  tags                       = local.tags
}
