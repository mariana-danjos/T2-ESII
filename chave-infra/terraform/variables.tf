variable "endpoint" {
  default     = ""
  description = "LocalStack endpoint. Deixe vazio para usar AWS real."
}

variable "region" {
  default = "us-east-1"
}

variable "db_name" {
  default = "chave_auth"
}

variable "db_user" {
  default = "chave"
}

variable "db_password" {
  default   = "chave_secret"
  sensitive = true
}

variable "ms_auth_host" {
  default = "chave-ms-auth"
}

variable "ms_auth_port" {
  default = "3001"
}

variable "ms_supplier_host" {
  default = "chave-ms-supplier"
}

variable "ms_supplier_port" {
  default = "3002"
}

variable "supplier_db_name" {
  default = "chave_supplier"
}

variable "supplier_db_password" {
  default   = "chave_secret"
  sensitive = true
}

variable "jwt_secret" {
  default   = "change-me-in-production"
  sensitive = true
}

variable "dockerhub_image" {
  default     = "itgirls/chave-ms-supplier:latest"
  description = "Imagem Docker do MS no Docker Hub (usuario/chave-ms-supplier:tag)"
}

variable "ec2_key_pair" {
  default     = ""
  description = "Nome do Key Pair EC2 para acesso SSH. Deixe vazio para criar sem acesso SSH."
}
