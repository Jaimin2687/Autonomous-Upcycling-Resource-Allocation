output "cluster_name" {
  description = "Name of the EKS cluster."
  value       = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  description = "Endpoint for the Kubernetes API server."
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_certificate_authority" {
  description = "Base64 encoded certificate data required to communicate with the cluster."
  value       = aws_eks_cluster.this.certificate_authority[0].data
}

output "oidc_provider_arn" {
  description = "ARN of the IAM OIDC provider associated with the cluster."
  value       = aws_iam_openid_connect_provider.this.arn
}

output "node_role_arns" {
  description = "IAM roles used by the node groups."
  value       = { for k, role in aws_iam_role.node : k => role.arn }
}

output "cluster_security_group_id" {
  description = "Security group ID for the EKS control plane."
  value       = aws_security_group.cluster.id
}

output "node_security_group_id" {
  description = "Security group ID for managed node groups."
  value       = aws_security_group.node.id
}
