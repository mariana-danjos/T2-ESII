#!/bin/bash
set -e

# Instala Docker no Amazon Linux 2023
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker

# Aguarda Docker iniciar
sleep 5

# Baixa e sobe o MS Supplier
docker run -d \
  --name chave-ms-supplier \
  --restart unless-stopped \
  -p 3002:3002 \
  -e PORT=3002 \
  -e NODE_ENV=production \
  -e JWT_SECRET="${jwt_secret}" \
  -e DB_HOST="${db_host}" \
  -e DB_PORT="${db_port}" \
  -e DB_USER="${db_user}" \
  -e DB_PASSWORD="${db_password}" \
  -e DB_NAME="${db_name}" \
  -e EVENTS_ENABLED=true \
  -e SNS_TOPIC_ARN="${sns_topic_arn}" \
  -e AWS_DEFAULT_REGION="${aws_region}" \
  ${dockerhub_image}
