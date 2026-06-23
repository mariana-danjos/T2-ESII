# Chave — Gestão de Fornecedores e Estoque

Sistema de gestão para varejo plus size desenvolvido como trabalho da disciplina de Engenharia de Software II (PUCRS 2026-1).

## Deploy na AWS

A aplicação está deployada na AWS EC2 e pode ser acessada nos seguintes endereços:

| Serviço | URL | Status |
|---|---|---|
| Shell (Frontend) | http://100.53.12.76:3000 | ✅ Online |
| API Supplier | http://100.53.12.76:3002 | ✅ Online |
| Swagger Docs | http://100.53.12.76:3002/docs | ✅ Online |
| MFE Supplier | http://100.53.12.76:4002 | ✅ Online |
| Health Check | http://100.53.12.76:3002/health | ✅ Online |

## Infraestrutura

- **Cloud:** AWS (us-east-1)
- **EC2:** t3.medium — Ubuntu 22.04
- **Banco de dados:** PostgreSQL 15 (container Docker)
- **Containers:** Docker + Docker Compose
- **LocalStack:** Ministack (S3, SNS, SQS, API Gateway)

---

## Estrutura do Projeto

O projeto segue a arquitetura de **Micro Frontends + Microsserviços**, onde cada funcionalidade é um módulo independente com deploy e ciclo de vida próprios.

```
T2-ESII/
├── chave-shell/          # Host app (Module Federation)
├── chave-ms-auth/        # Microsserviço de autenticação
├── chave-ms-supplier/    # Microsserviço de fornecedores
├── chave-mfe-auth/       # Micro frontend de autenticação
├── chave-mfe-supplier/   # Micro frontend de fornecedores
├── chave-infra/          # Infraestrutura (Docker Compose + Terraform)
└── .github/workflows/    # Pipelines CI/CD
```

---

### chave-shell

Shell app responsável por hospedar e orquestrar os micro frontends via **Module Federation**.

```
chave-shell/
├── src/
│   ├── App.jsx           # Roteamento e carregamento dinâmico dos MFEs
│   └── main.jsx
├── vite.config.js        # Configuração do Module Federation (remotes)
├── Dockerfile
└── package.json
```

- **Tecnologias:** React 18, Vite 5, `@originjs/vite-plugin-federation`
- **Porta:** 3000
- **Função:** Carrega `mfe_auth` (porta 4001) e `mfe_supplier` (porta 4002) como módulos remotos em tempo de execução no browser

---

### chave-ms-supplier

Microsserviço REST para cadastro e gestão de fornecedores, produtos vinculados e pedidos de reposição.

```
chave-ms-supplier/
├── src/
│   ├── controllers/      # Camada HTTP (request/response)
│   │   ├── supplierController.ts
│   │   ├── supplierProductController.ts
│   │   └── replenishmentController.ts
│   ├── services/         # Regras de negócio
│   │   ├── supplierService.ts
│   │   ├── supplierProductService.ts
│   │   └── replenishmentService.ts
│   ├── repositories/     # Acesso ao banco de dados (SQL puro + pg)
│   │   ├── supplierRepository.ts
│   │   ├── supplierProductRepository.ts
│   │   └── replenishmentRepository.ts
│   ├── middleware/
│   │   ├── auth.ts       # Validação JWT
│   │   └── errorHandler.ts
│   ├── messaging/
│   │   └── snsPublisher.ts  # Publica eventos no AWS SNS
│   ├── validation/
│   │   ├── schemas.ts    # Schemas Zod
│   │   └── document.ts   # Validação CPF/CNPJ
│   ├── domain/
│   │   └── types.ts      # Tipos e interfaces do domínio
│   ├── config/
│   │   └── env.ts        # Carregamento de variáveis de ambiente
│   ├── db/
│   │   └── pool.ts       # Pool de conexões PostgreSQL
│   ├── routes/
│   │   └── index.ts      # Registro de rotas Express
│   └── app.ts            # Setup do Express + Swagger
├── migrations/           # Migrações do banco (node-pg-migrate)
├── scripts/
│   └── seed.ts           # Script de carga inicial de dados
├── docs/
│   ├── ADR.md            # Decisões de arquitetura
│   └── INTEGRATION.md    # Guia de integração
├── openapi.yaml          # Especificação OpenAPI 3.0
├── Dockerfile
└── package.json
```

- **Tecnologias:** Node.js 20, Express, TypeScript, PostgreSQL 15, Zod, JWT, AWS SDK v3 (SNS)
- **Porta:** 3002
- **Banco:** `chave_supplier` (PostgreSQL, porta 5433 no Docker)
- **Eventos:** Publica no SNS (`chave-supplier-events`) ao criar/atualizar fornecedores e reposições

---

### chave-mfe-supplier

Micro frontend de fornecedores, exposto como módulo remoto do Module Federation.

```
chave-mfe-supplier/
├── src/
│   ├── pages/
│   │   ├── SupplierApp.tsx        # Entry point do módulo remoto
│   │   ├── SupplierListPage.tsx   # Listagem paginada com filtros
│   │   ├── SupplierFormPage.tsx   # Formulário de criação/edição
│   │   └── SupplierDetailPage.tsx # Detalhes (dados, produtos, reposições)
│   ├── components/
│   │   ├── LinkProductDialog.tsx  # Dialog para vincular produtos
│   │   └── ReplenishmentDialog.tsx # Dialog para pedido de reposição
│   ├── api/
│   │   ├── client.ts             # Instância HTTP configurada
│   │   ├── createApi.ts          # Factory de chamadas à API
│   │   └── types.ts              # Tipos dos recursos da API
│   └── theme.ts                  # Tema MUI customizado
├── vite.config.ts                # Expõe os módulos remotos via federation
├── Dockerfile
└── package.json
```

- **Tecnologias:** React 18, TypeScript, Vite 5, MUI v9, `@mui/x-data-grid`
- **Porta:** 4002
- **Módulos expostos:** `SupplierApp`, `SupplierListPage`, `SupplierFormPage`, `SupplierDetailPage`

---

### chave-ms-auth / chave-mfe-auth

Microsserviço de autenticação e seu respectivo micro frontend.

- **chave-ms-auth** (porta 3001): Emite tokens JWT. Banco `chave_auth` (PostgreSQL, porta 5432).
- **chave-mfe-auth** (porta 4001): Tela de login, armazena token em `localStorage` e expõe módulo remoto para o Shell.

---

### chave-infra

Toda a infraestrutura do projeto está centralizada aqui.

```
chave-infra/
├── docker-compose.yml    # Orquestra todos os 8 serviços
├── .env.example          # Template de variáveis de ambiente
├── Makefile              # Atalhos: make setup / make down / make logs
└── terraform/
    ├── main.tf           # Recursos AWS: EC2, RDS, S3, SNS, SQS, API Gateway
    ├── variables.tf      # Variáveis do Terraform
    └── userdata.sh       # Script de inicialização da EC2
```

O Terraform é **dual-mode**: quando a variável `endpoint` está preenchida, aponta para o Ministack (LocalStack local). Quando vazia, provisiona recursos reais na AWS.

**Recursos provisionados:**
| Recurso | Local (Ministack) | AWS Real |
|---|---|---|
| S3 `chave-media` | ✅ | ✅ |
| S3 `chave-mfe-supplier` | — | ✅ |
| S3 `chave-shell` | — | ✅ |
| RDS `chave-auth-db` | ✅ | ✅ |
| RDS `chave-supplier-db` | ✅ | ✅ |
| EC2 `chave-ms-supplier` | — | ✅ |
| SNS `chave-supplier-events` | ✅ | ✅ |
| SQS `chave-supplier-events-queue` | ✅ | ✅ |
| API Gateway `chave-api` | ✅ | ✅ |

---

### CI/CD (.github/workflows/)

| Pipeline | Trigger | Etapas |
|---|---|---|
| `ms-supplier-ci-cd.yml` | Push `main` / tag `v*` / PR | lint → migrate → test → build → push DockerHub |
| `mfe-supplier-ci-cd.yml` | Push `main` / tag `v*` / PR | lint → test → build → publish npm |

---

## Stack de Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, MUI v9, Module Federation |
| Backend | Node.js 20, Express, TypeScript, Zod, JWT |
| Banco de dados | PostgreSQL 15, node-pg-migrate |
| Mensageria | AWS SNS + SQS |
| Infraestrutura | Docker, Docker Compose, Terraform |
| CI/CD | GitHub Actions |
| Local Cloud | Ministack (LocalStack) |

---

## Como rodar localmente

```bash
cd chave-infra
cp .env.example .env
docker compose up -d --build
```

Acompanhe os logs:

```bash
docker compose logs -f
```

### Serviços disponíveis localmente

| Serviço | URL |
|---|---|
| Shell | http://localhost:3000 |
| MS Auth | http://localhost:3001 |
| MS Supplier | http://localhost:3002 |
| Swagger | http://localhost:3002/docs |
| MFE Auth | http://localhost:4001 |
| MFE Supplier | http://localhost:4002 |
| Ministack | http://localhost:4566 |
