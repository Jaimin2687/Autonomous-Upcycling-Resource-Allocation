terraform {
  required_version = ">= 1.6.0"
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet"
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "aws_security_group" "this" {
  name        = "${var.name}-rds"
  description = "Security group for RDS"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.port
    to_port         = var.port
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
    cidr_blocks     = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_db_parameter_group" "this" {
  name   = "${var.name}-postgres"
  family = var.parameter_family
  tags   = var.tags

  dynamic "parameter" {
    for_each = var.parameters
    content {
      name  = parameter.value.name
      value = parameter.value.value
    }
  }
}

resource "aws_db_instance" "this" {
  identifier                      = var.name
  engine                          = "postgres"
  engine_version                  = var.engine_version
  instance_class                  = var.instance_class
  allocated_storage               = var.allocated_storage
  max_allocated_storage           = var.max_allocated_storage
  storage_encrypted               = true
  kms_key_id                      = var.kms_key_arn
  username                        = var.username
  password                        = var.password
  port                            = var.port
  db_subnet_group_name            = aws_db_subnet_group.this.name
  vpc_security_group_ids          = [aws_security_group.this.id]
  publicly_accessible             = false
  multi_az                        = var.multi_az
  backup_retention_period         = var.backup_retention_days
  delete_automated_backups        = true
  deletion_protection             = var.deletion_protection
  skip_final_snapshot             = !var.final_snapshot_on_delete
  final_snapshot_identifier       = var.final_snapshot_on_delete ? "${var.name}-final-${random_id.final.hex}" : null
  auto_minor_version_upgrade      = true
  maintenance_window              = var.maintenance_window
  backup_window                   = var.backup_window
  performance_insights_enabled    = true
  performance_insights_kms_key_id = var.kms_key_arn
  parameter_group_name            = aws_db_parameter_group.this.name
  monitoring_interval             = var.enhanced_monitoring_interval
  monitoring_role_arn             = var.monitoring_role_arn
  apply_immediately               = var.apply_immediately
  tags                            = var.tags
}

resource "random_id" "final" {
  byte_length = 4
}
