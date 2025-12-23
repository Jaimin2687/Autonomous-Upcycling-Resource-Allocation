terraform {
  required_version = ">= 1.6.0"
}

resource "aws_secretsmanager_secret" "this" {
  name                    = var.name
  description             = var.description
  recovery_window_in_days = var.recovery_window_in_days
  kms_key_id              = var.kms_key_arn
  tags                    = var.tags
}

resource "aws_secretsmanager_secret_version" "this" {
  count         = var.initial_secret_value != null ? 1 : 0
  secret_id     = aws_secretsmanager_secret.this.id
  secret_string = var.initial_secret_value
}

resource "aws_secretsmanager_secret_rotation" "this" {
  count               = var.rotation_lambda_arn != null ? 1 : 0
  secret_id           = aws_secretsmanager_secret.this.id
  rotation_lambda_arn = var.rotation_lambda_arn

  rotation_rules {
    automatically_after_days = var.rotation_interval_days
  }
}
