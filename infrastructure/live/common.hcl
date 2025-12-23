locals {
  project    = "AURA"
  aws_region = get_env("AWS_REGION", "us-east-1")
  base_tags = {
    Project   = local.project
    ManagedBy = "terragrunt"
    Owner     = "platform"
  }
}

inputs = {
  project    = local.project
  aws_region = local.aws_region
  base_tags  = local.base_tags
}
