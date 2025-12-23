variable "namespace" {
  description = "Namespace for observability stack."
  type        = string
  default     = "observability"
}

variable "prometheus_chart_version" {
  description = "Chart version for kube-prometheus-stack."
  type        = string
  default     = "57.0.2"
}

variable "loki_chart_version" {
  description = "Chart version for Loki."
  type        = string
  default     = "6.5.2"
}

variable "tempo_chart_version" {
  description = "Chart version for Tempo."
  type        = string
  default     = "1.10.3"
}

variable "grafana_chart_version" {
  description = "Chart version for Grafana."
  type        = string
  default     = "7.3.10"
}

variable "otel_collector_chart_version" {
  description = "Chart version for the OpenTelemetry collector."
  type        = string
  default     = "0.85.0"
}

variable "prometheus_values" {
  description = "Override values for the Prometheus stack."
  type        = any
  default = {
    prometheus = {
      additionalScrapeConfigs = []
    }
    grafana = {
      enabled = false
    }
    alertmanager = {
      replicas = 2
    }
  }
}

variable "loki_values" {
  description = "Override values for Loki."
  type        = any
  default = {
    persistence = {
      enabled = true
      size    = "200Gi"
    }
  }
}

variable "tempo_values" {
  description = "Override values for Tempo."
  type        = any
  default = {
    persistence = {
      enabled = true
      size    = "100Gi"
    }
  }
}

variable "grafana_values" {
  description = "Override values for Grafana."
  type        = any
  default = {
    adminUser     = "admin"
    adminPassword = "changeme"
    service = {
      type = "ClusterIP"
    }
  }
}

variable "otel_collector_values" {
  description = "Override values for the OpenTelemetry collector."
  type        = any
  default = {
    mode = "daemonset"
    config = {
      receivers = {
        otlp = {
          protocols = {
            grpc = {}
            http = {}
          }
        }
      }
      exporters = {
        otlp = {
          endpoint = "tempo:4317"
          tls = {
            insecure = true
          }
        }
        logging = {
          loglevel = "error"
        }
      }
      service = {
        pipelines = {
          traces = {
            receivers  = ["otlp"]
            processors = ["batch"]
            exporters  = ["otlp", "logging"]
          }
        }
      }
      processors = {
        batch = {}
      }
    }
  }
}
