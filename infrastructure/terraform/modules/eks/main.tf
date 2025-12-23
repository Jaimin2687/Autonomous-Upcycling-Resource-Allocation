terraform {
  required_version = ">= 1.6.0"
}

locals {
  cluster_tags = merge(var.tags, {
    "kubernetes.io/cluster/${var.name}" = "shared"
  })
}

resource "aws_iam_role" "cluster" {
  name               = "${var.name}-eks-cluster"
  assume_role_policy = data.aws_iam_policy_document.cluster_assume_role.json
  tags               = var.tags
}

data "aws_iam_policy_document" "cluster_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "cluster" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_security_group" "cluster" {
  name        = "${var.name}-eks-cluster"
  description = "Cluster security group"
  vpc_id      = var.vpc_id
  tags        = var.tags
}

resource "aws_cloudwatch_log_group" "cluster" {
  name              = "/aws/eks/${var.name}/cluster"
  retention_in_days = var.control_plane_log_retention_days
  kms_key_id        = var.kms_key_arn
  tags              = var.tags
}

resource "aws_eks_cluster" "this" {
  name     = var.name
  role_arn = aws_iam_role.cluster.arn

  version = var.kubernetes_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_public_access  = var.endpoint_public_access
    endpoint_private_access = var.endpoint_private_access
    public_access_cidrs     = var.endpoint_public_access_cidrs
  }

  enabled_cluster_log_types = var.enabled_control_plane_logs

  timeouts {
    create = "30m"
    delete = "30m"
  }

  tags = local.cluster_tags

  depends_on = [
    aws_cloudwatch_log_group.cluster,
    aws_iam_role_policy_attachment.cluster
  ]
}

resource "aws_iam_openid_connect_provider" "this" {
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    data.tls_certificate.eks_cluster.certificates[0].sha1_fingerprint
  ]
  url = aws_eks_cluster.this.identity[0].oidc[0].issuer
}

data "tls_certificate" "eks_cluster" {
  url = aws_eks_cluster.this.identity[0].oidc[0].issuer
}

resource "aws_iam_role" "node" {
  for_each           = var.node_groups
  name               = "${var.name}-${each.key}-node"
  assume_role_policy = data.aws_iam_policy_document.node_assume_role.json
  tags               = var.tags
}

data "aws_iam_policy_document" "node_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "node_worker" {
  for_each = var.node_groups

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node[each.key].name
}

resource "aws_iam_role_policy_attachment" "node_cni" {
  for_each = var.node_groups

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node[each.key].name
}

resource "aws_iam_role_policy_attachment" "node_registry" {
  for_each = var.node_groups

  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node[each.key].name
}

resource "aws_security_group" "node" {
  name        = "${var.name}-eks-node"
  description = "Managed node group security group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Cluster API"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.cluster.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_eks_node_group" "this" {
  for_each             = var.node_groups
  cluster_name         = aws_eks_cluster.this.name
  node_group_name      = each.key
  node_role_arn        = aws_iam_role.node[each.key].arn
  subnet_ids           = lookup(each.value, "subnet_ids", var.private_subnet_ids)
  ami_type             = lookup(each.value, "ami_type", "AL2_x86_64")
  disk_size            = lookup(each.value, "disk_size", 50)
  instance_types       = lookup(each.value, "instance_types", ["m6i.large"])
  capacity_type        = lookup(each.value, "capacity_type", "ON_DEMAND")
  force_update_version = true
  release_version      = lookup(each.value, "release_version", null)
  version              = lookup(each.value, "kubernetes_version", var.kubernetes_version)

  scaling_config {
    desired_size = lookup(each.value, "desired_size", 3)
    max_size     = lookup(each.value, "max_size", 6)
    min_size     = lookup(each.value, "min_size", 2)
  }

  update_config {
    max_unavailable = lookup(each.value, "max_unavailable", 1)
  }

  labels = merge({
    "aura.dev/environment" = var.environment
  }, lookup(each.value, "labels", {}))

  taints = lookup(each.value, "taints", [])

  tags = merge(var.tags, {
    Name = "${var.name}-${each.key}"
  })

  depends_on = [
    aws_iam_role_policy_attachment.node_worker,
    aws_iam_role_policy_attachment.node_cni,
    aws_iam_role_policy_attachment.node_registry
  ]
}
