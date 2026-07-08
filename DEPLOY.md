# Deploy em droplet DigitalOcean

Stack: **Caddy (HTTPS)** + web + api + Ollama + SQLite.

**Requisitos:** Ubuntu 22.04+, 4 GB RAM, 2 vCPUs, portas 80 e 443 abertas.

## Passo a passo

### 1. DNS

Crie registro **A** apontando `@` (e opcionalmente `www`) para o IP do droplet.

### 2. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Código no servidor

```bash
git clone <url-do-repositorio> project-manager
cd project-manager
```

### 4. Variáveis de ambiente

```bash
cp .env.docker.example .env
nano .env
```

```env
DOMAIN=projectmanager.semtrip.com
ACME_EMAIL=seu-email@exemplo.com
CORS_ORIGIN=https://projectmanager.semtrip.com
NEXT_PUBLIC_API_URL=
OLLAMA_MODEL=llama3.2
```

### 5. Subir

```bash
docker compose up -d --build
docker compose logs -f
```

Na primeira execução o Ollama baixa o modelo (pode demorar). O Caddy emite o certificado HTTPS automaticamente.

### 6. Verificar

- `https://projectmanager.semtrip.com` — frontend
- `https://projectmanager.semtrip.com/docs` — Swagger
- `https://projectmanager.semtrip.com/health` — health check

## Comandos úteis

```bash
docker compose ps
docker compose down
docker compose up -d --build          # após atualizar código
docker compose up -d --build web      # após mudar CORS_ORIGIN
docker compose logs -f caddy
```

## Droplet com 2 GB RAM

Use `OLLAMA_MODEL=llama3.2:1b` no `.env`.
