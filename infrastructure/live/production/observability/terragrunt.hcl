include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  parent    = read_terragrunt_config(find_in_parent_folders())
  obs_conf  = local.parent.locals.observability
}

dependency "eks" {
  config_path = "../eks"
}

terraform {
  source = "../../../terraform/modules/observability"
}

generate "kube_provider" {
  path      = "provider_override.tf"
  if_exists = "overwrite"
  contents  = <<EOF
data "aws_eks_cluster_auth" "this" {
  name = "${dependency.eks.outputs.cluster_name}"
}

provider "kubernetes" {
  host                   = "${dependency.eks.outputs.cluster_endpoint}"
  cluster_ca_certificate = base64decode("${dependency.eks.outputs.cluster_certificate_authority}")
  token                  = data.aws_eks_cluster_auth.this.token
}

provider "helm" {
  kubernetes {
    host                   = "${dependency.eks.outputs.cluster_endpoint}"
    cluster_ca_certificate = base64decode("${dependency.eks.outputs.cluster_certificate_authority}")
    token                  = data.aws_eks_cluster_auth.this.token
  }
}
EOF
}

inputs = {
  namespace = try(local.obs_conf.namespace, "observability")
}
