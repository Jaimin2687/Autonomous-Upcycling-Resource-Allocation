terraform {
  required_version = ">= 1.6.0"
}

resource "kubernetes_namespace" "observability" {
  metadata {
    name = var.namespace
    labels = {
      "aura.dev/component" = "observability"
    }
  }
}

resource "helm_release" "prometheus" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.observability.metadata[0].name
  version    = var.prometheus_chart_version

  values = [yamlencode(var.prometheus_values)]

  depends_on = [kubernetes_namespace.observability]
}

resource "helm_release" "loki" {
  name       = "loki"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki"
  namespace  = kubernetes_namespace.observability.metadata[0].name
  version    = var.loki_chart_version
  values     = [yamlencode(var.loki_values)]

  depends_on = [kubernetes_namespace.observability]
}

resource "helm_release" "tempo" {
  name       = "tempo"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "tempo"
  namespace  = kubernetes_namespace.observability.metadata[0].name
  version    = var.tempo_chart_version
  values     = [yamlencode(var.tempo_values)]

  depends_on = [kubernetes_namespace.observability]
}

resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  namespace  = kubernetes_namespace.observability.metadata[0].name
  version    = var.grafana_chart_version
  values     = [yamlencode(var.grafana_values)]

  depends_on = [kubernetes_namespace.observability]
}

resource "helm_release" "otel_collector" {
  name       = "otel-collector"
  repository = "https://open-telemetry.github.io/opentelemetry-helm-charts"
  chart      = "opentelemetry-collector"
  namespace  = kubernetes_namespace.observability.metadata[0].name
  version    = var.otel_collector_chart_version
  values     = [yamlencode(var.otel_collector_values)]

  depends_on = [kubernetes_namespace.observability]
}
