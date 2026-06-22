terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = var.region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3         = var.endpoint
    rds        = var.endpoint
    apigateway = var.endpoint
    sts        = var.endpoint
    sns        = var.endpoint
    sqs        = var.endpoint
  }
}

# ─── S3 ───────────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "media" {
  bucket = "chave-media"
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = "Enabled"
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

# ─── Supplier RDS (parity with AWS; dev uses the postgres container) ───────────
resource "aws_db_instance" "supplier" {
  identifier          = "chave-supplier-db"
  engine              = "postgres"
  engine_version      = "15.3"
  instance_class      = "db.t3.micro"
  username            = var.db_user
  password            = var.db_password
  db_name             = var.supplier_db_name
  allocated_storage   = 20
  multi_az            = false
  publicly_accessible = false
  skip_final_snapshot = true
}

# ─── Supplier events ───────────────────────────────────────────────────────────
resource "aws_sns_topic" "supplier_events" {
  name = "chave-supplier-events"
}

resource "aws_sqs_queue" "supplier_events" {
  name = "chave-supplier-events-queue"
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

# POST /auth/login

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

# POST /auth/refresh

resource "aws_api_gateway_resource" "auth_refresh" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "refresh"
}

resource "aws_api_gateway_method" "auth_refresh" {
  rest_api_id   = aws_api_gateway_rest_api.chave.id
  resource_id   = aws_api_gateway_resource.auth_refresh.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_refresh" {
  rest_api_id             = aws_api_gateway_rest_api.chave.id
  resource_id             = aws_api_gateway_resource.auth_refresh.id
  http_method             = aws_api_gateway_method.auth_refresh.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "POST"
  uri                     = "http://${var.ms_auth_host}:${var.ms_auth_port}/refresh"
}

# POST /auth/logout

resource "aws_api_gateway_resource" "auth_logout" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "logout"
}

resource "aws_api_gateway_method" "auth_logout" {
  rest_api_id   = aws_api_gateway_rest_api.chave.id
  resource_id   = aws_api_gateway_resource.auth_logout.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_logout" {
  rest_api_id             = aws_api_gateway_rest_api.chave.id
  resource_id             = aws_api_gateway_resource.auth_logout.id
  http_method             = aws_api_gateway_method.auth_logout.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "POST"
  uri                     = "http://${var.ms_auth_host}:${var.ms_auth_port}/logout"
}

# GET /auth/me

resource "aws_api_gateway_resource" "auth_me" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "me"
}

resource "aws_api_gateway_method" "auth_me" {
  rest_api_id   = aws_api_gateway_rest_api.chave.id
  resource_id   = aws_api_gateway_resource.auth_me.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_me" {
  rest_api_id             = aws_api_gateway_rest_api.chave.id
  resource_id             = aws_api_gateway_resource.auth_me.id
  http_method             = aws_api_gateway_method.auth_me.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.ms_auth_host}:${var.ms_auth_port}/me"
}

# ─── Supplier routes (greedy proxy) ────────────────────────────────────────────
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
  uri                     = "http://${var.ms_supplier_host}:${var.ms_supplier_port}/suppliers"
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
  uri                     = "http://${var.ms_supplier_host}:${var.ms_supplier_port}/suppliers/{proxy}"
  request_parameters      = { "integration.request.path.proxy" = "method.request.path.proxy" }
}

# ─── Deployment ───────────────────────────────────────────────────────────────

resource "aws_api_gateway_deployment" "chave" {
  rest_api_id = aws_api_gateway_rest_api.chave.id
  stage_name  = "v1"

  depends_on = [
    aws_api_gateway_integration.auth_login,
    aws_api_gateway_integration.auth_refresh,
    aws_api_gateway_integration.auth_logout,
    aws_api_gateway_integration.auth_me,
    aws_api_gateway_integration.suppliers_any,
    aws_api_gateway_integration.suppliers_proxy_any,
  ]
}

output "gateway_url" {
  value = "${var.endpoint}/restapis/${aws_api_gateway_rest_api.chave.id}/v1/_user_request_"
}
