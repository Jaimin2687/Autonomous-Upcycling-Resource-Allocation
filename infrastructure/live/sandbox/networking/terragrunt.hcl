include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  parent = read_terragrunt_config(find_in_parent_folders())
  networking = local.parent.locals.networking
  tags       = local.parent.inputs.tags
  region     = local.parent.inputs.aws_region
}

terraform {
  source = "../../../terraform/modules/networking"
}

inputs = {
  name                 = local.networking.name
  region               = local.region
  vpc_cidr             = local.networking.vpc_cidr
  public_subnets       = local.networking.public_subnets
  private_subnets      = local.networking.private_subnets
  availability_zones   = local.networking.availability_zones
  nat_gateway_strategy = local.networking.nat_gateway_strategy
  tags                 = local.tags
}
