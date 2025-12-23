output "namespace" {
  description = "Namespace where observability stack is installed."
  value       = kubernetes_namespace.observability.metadata[0].name
}

output "prometheus_release_name" {
  description = "Helm release name for Prometheus."
  value       = helm_release.prometheus.name
}

output "grafana_release_name" {
  description = "Helm release name for Grafana."
  value       = helm_release.grafana.name
}
