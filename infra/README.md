# Infrastructure

Infrastructure-as-code and deployment configurations.

## Structuree

```
infra/
├── docker/          # Docker configurations
├── terraform/       # Terraform IaC (optional)
├── supabase/        # Supabase configs (if using)
├── redis/           # Redis configs
├── s3/              # S3 bucket configs
└── monitoring/      # Monitoring & observability
```

## Purpose

This directory contains infrastructure code that is:

- **Not part of the application code**
- **Deployed separately** from apps
- **Environment-specific** (dev, staging, prod)

## Examples

### Docker

- Dockerfiles for apps
- docker-compose.yml for local development
- Multi-stage builds

### Terraform

- AWS/GCP/Azure infrastructure
- Database provisioning
- Networking configuration
- CI/CD pipelines

### Monitoring

- Datadog/New Relic configs
- Log aggregation setup
- Alert definitions

## Usage

```bash
# Build Docker images
docker build -f infra/docker/chat.Dockerfile -t raweval-chat .

# Apply Terraform
cd infra/terraform && terraform apply

# Deploy monitoring
cd infra/monitoring && ./deploy.sh
```
