terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ─── Provider ─────────────────────────────────────────────────────────────────
# Com endpoint vazio usa AWS real; com endpoint preenchido usa LocalStack.

provider "aws" {
  region = var.region

  # Credenciais hardcoded só para LocalStack (ignoradas na AWS real)
  access_key = var.endpoint != "" ? "test" : null
  secret_key = var.endpoint != "" ? "test" : null

  skip_credentials_validation = var.endpoint != ""
  skip_metadata_api_check     = var.endpoint != ""
  skip_requesting_account_id  = var.endpoint != ""
  s3_use_path_style           = var.endpoint != ""

  dynamic "endpoints" {
    for_each = var.endpoint != "" ? [1] : []
    content {
      s3         = var.endpoint
      rds        = var.endpoint
      apigateway = var.endpoint
      sts        = var.endpoint
      sns        = var.endpoint
      sqs        = var.endpoint
      ec2        = var.endpoint
    }
  }
}

locals {
  is_localstack = var.endpoint != ""
}

# ─── S3 ───────────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "media" {
  bucket = "chave-media"
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration { status = "Enabled" }
}

# Bucket para o MFE (assets estáticos)
resource "aws_s3_bucket" "mfe_supplier" {
  count  = local.is_localstack ? 0 : 1
  bucket = "chave-mfe-supplier-${data.aws_caller_identity.current[0].account_id}"
}

resource "aws_s3_bucket_public_access_block" "mfe_supplier" {
  count  = local.is_localstack ? 0 : 1
  bucket = aws_s3_bucket.mfe_supplier[0].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "mfe_supplier" {
  count  = local.is_localstack ? 0 : 1
  bucket = aws_s3_bucket.mfe_supplier[0].id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

resource "aws_s3_bucket_policy" "mfe_supplier_public" {
  count  = local.is_localstack ? 0 : 1
  bucket = aws_s3_bucket.mfe_supplier[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.mfe_supplier[0].arn}/*"
    }]
  })
}

# Bucket para o Shell
resource "aws_s3_bucket" "shell" {
  count  = local.is_localstack ? 0 : 1
  bucket = "chave-shell-${data.aws_caller_identity.current[0].account_id}"
}

resource "aws_s3_bucket_public_access_block" "shell" {
  count  = local.is_localstack ? 0 : 1
  bucket = aws_s3_bucket.shell[0].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "shell" {
  count  = local.is_localstack ? 0 : 1
  bucket = aws_s3_bucket.shell[0].id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

resource "aws_s3_bucket_policy" "shell_public" {
  count  = local.is_localstack ? 0 : 1
  bucket = aws_s3_bucket.shell[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.shell[0].arn}/*"
    }]
  })
}

data "aws_caller_identity" "current" {
  count = local.is_localstack ? 0 : 1
}

# ─── Networking ───────────────────────────────────────────────────────────────

data "aws_vpc" "default" {
  count   = local.is_localstack ? 0 : 1
  default = true
}

data "aws_subnets" "default" {
  count = local.is_localstack ? 0 : 1
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default[0].id]
  }
}

# Security Group do EC2 — permite SSH (22) e porta do MS (3002)
resource "aws_security_group" "ec2_ms" {
  count       = local.is_localstack ? 0 : 1
  name        = "chave-ms-supplier-sg"
  description = "MS Supplier EC2"
  vpc_id      = data.aws_vpc.default[0].id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3002
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group do RDS — permite conexão só do EC2
resource "aws_security_group" "rds_supplier" {
  count       = local.is_localstack ? 0 : 1
  name        = "chave-supplier-rds-sg"
  description = "Supplier RDS — acesso somente do EC2 MS"
  vpc_id      = data.aws_vpc.default[0].id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_ms[0].id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ─── RDS ──────────────────────────────────────────────────────────────────────

resource "aws_db_instance" "auth" {
  identifier          = "chave-auth-db"
  engine              = "postgres"
  engine_version      = "15.3"
  instance_class      = "db.t3.micro"
  username            = var.db_user
  password            = var.db_password
  db_name             = var.db_name
  allocated_storage   = 20
  multi_az            = false
  publicly_accessible = false
  skip_final_snapshot = true
}

resource "aws_db_instance" "supplier" {
  identifier             = "chave-supplier-db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = "db.t3.micro"
  username               = var.db_user
  password               = var.supplier_db_password
  db_name                = var.supplier_db_name
  allocated_storage      = 20
  multi_az               = false
  publicly_accessible    = false
  skip_final_snapshot    = true
  vpc_security_group_ids = local.is_localstack ? [] : [aws_security_group.rds_supplier[0].id]
}

# ─── EC2 — chave-ms-supplier ──────────────────────────────────────────────────

data "aws_ami" "amazon_linux" {
  count       = local.is_localstack ? 0 : 1
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "ms_supplier" {
  count                  = local.is_localstack ? 0 : 1
  ami                    = data.aws_ami.amazon_linux[0].id
  instance_type          = "t2.micro"
  key_name               = var.ec2_key_pair != "" ? var.ec2_key_pair : null
  vpc_security_group_ids = [aws_security_group.ec2_ms[0].id]

  user_data = base64encode(templatefile("${path.module}/userdata.sh", {
    dockerhub_image      = var.dockerhub_image
    jwt_secret           = var.jwt_secret
    db_host              = aws_db_instance.supplier.address
    db_port              = "5432"
    db_user              = var.db_user
    db_password          = var.supplier_db_password
    db_name              = var.supplier_db_name
    sns_topic_arn        = aws_sns_topic.supplier_events.arn
    aws_region           = var.region
  }))

  tags = { Name = "chave-ms-supplier" }
}

resource "aws_eip" "ms_supplier" {
  count    = local.is_localstack ? 0 : 1
  instance = aws_instance.ms_supplier[0].id
  domain   = "vpc"
  tags     = { Name = "chave-ms-supplier-eip" }
}

# ─── Supplier events ───────────────────────────────────────────────────────────

resource "aws_sns_topic" "supplier_events" {
  name = "chave-supplier-events"
}

resource "aws_sqs_queue" "supplier_events" {
  name = "chave-supplier-events-queue"
}

resource "aws_sns_topic_subscription" "supplier_sqs" {
  topic_arn = aws_sns_topic.supplier_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.supplier_events.arn
}

# ─── API Gateway ──────────────────────────────────────────────────────────────

resource "aws_api_gateway_rest_api" "chave" {
  name = "chave-api"
}

resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  parent_id   = aws_api_gateway_rest_api.chave.root_resource_id
  path_part   = "auth"
}

resource "aws_api_gateway_resource" "auth_login" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "login"
}

resource "aws_api_gateway_method" "auth_login" {
  rest_api_id   = aws_api_gateway_rest_api.chave.id
  resource_id   = aws_api_gateway_resource.auth_login.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_login" {
  rest_api_id             = aws_api_gateway_rest_api.chave.id
  resource_id             = aws_api_gateway_resource.auth_login.id
  http_method             = aws_api_gateway_method.auth_login.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "POST"
  uri                     = "http://${var.ms_auth_host}:${var.ms_auth_port}/login"
}

resource "aws_api_gateway_resource" "suppliers" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  parent_id   = aws_api_gateway_rest_api.chave.root_resource_id
  path_part   = "suppliers"
}

resource "aws_api_gateway_resource" "suppliers_proxy" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  parent_id   = aws_api_gateway_resource.suppliers.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "suppliers_any" {
  rest_api_id   = aws_api_gateway_rest_api.chave.id
  resource_id   = aws_api_gateway_resource.suppliers.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "suppliers_any" {
  rest_api_id             = aws_api_gateway_rest_api.chave.id
  resource_id             = aws_api_gateway_resource.suppliers.id
  http_method             = aws_api_gateway_method.suppliers_any.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${local.is_localstack ? "${var.ms_supplier_host}:${var.ms_supplier_port}" : "${aws_eip.ms_supplier[0].public_ip}:3002"}/suppliers"
}

resource "aws_api_gateway_method" "suppliers_proxy_any" {
  rest_api_id        = aws_api_gateway_rest_api.chave.id
  resource_id        = aws_api_gateway_resource.suppliers_proxy.id
  http_method        = "ANY"
  authorization      = "NONE"
  request_parameters = { "method.request.path.proxy" = true }
}

resource "aws_api_gateway_integration" "suppliers_proxy_any" {
  rest_api_id             = aws_api_gateway_rest_api.chave.id
  resource_id             = aws_api_gateway_resource.suppliers_proxy.id
  http_method             = aws_api_gateway_method.suppliers_proxy_any.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${local.is_localstack ? "${var.ms_supplier_host}:${var.ms_supplier_port}" : "${aws_eip.ms_supplier[0].public_ip}:3002"}/suppliers/{proxy}"
  request_parameters      = { "integration.request.path.proxy" = "method.request.path.proxy" }
}

resource "aws_api_gateway_deployment" "chave" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  stage_name  = "v1"

  depends_on = [
    aws_api_gateway_integration.auth_login,
    aws_api_gateway_integration.suppliers_any,
    aws_api_gateway_integration.suppliers_proxy_any,
  ]
}

# ─── Outputs ──────────────────────────────────────────────────────────────────

output "gateway_url" {
  value = local.is_localstack ? "${var.endpoint}/restapis/${aws_api_gateway_rest_api.chave.id}/v1/_user_request_" : "https://${aws_api_gateway_rest_api.chave.id}.execute-api.${var.region}.amazonaws.com/v1"
}

output "ec2_public_ip" {
  value = local.is_localstack ? "n/a (localstack)" : aws_eip.ms_supplier[0].public_ip
}

output "rds_supplier_endpoint" {
  value = aws_db_instance.supplier.address
}

output "sns_topic_arn" {
  value = aws_sns_topic.supplier_events.arn
}

output "mfe_bucket_website" {
  value = local.is_localstack ? "n/a" : aws_s3_bucket_website_configuration.mfe_supplier[0].website_endpoint
}

output "shell_bucket_website" {
  value = local.is_localstack ? "n/a" : aws_s3_bucket_website_configuration.shell[0].website_endpoint
}
