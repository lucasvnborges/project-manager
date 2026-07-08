# Deploy em droplet DigitalOcean

Este guia sobe a stack completa (nginx + web + api + Ollama + SQLite persistente) com Docker Compose em um droplet Ubuntu.

## Requisitos do droplet

| Recurso | Mínimo recomendado |
| --- | --- |
| SO | Ubuntu 22.04 ou 24.04 LTS |
| RAM | 4 GB (modelos Ollama consomem memória) |
| CPU | 2 vCPUs |
| Disco | 25 GB SSD |
| Portas | 80 (HTTP), 22 (SSH) |

Para droplets com 2 GB de RAM, use um modelo menor, por exemplo `OLLAMA_MODEL=llama3.2:1b`.

## 1. Provisionar o droplet

1. Crie um droplet Ubuntu na DigitalOcean.
2. Adicione sua chave SSH.
3. Anote o IP público do droplet.

## 2. Instalar Docker no servidor

Conecte via SSH e execute:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
newgrp docker
sudo apt-get install -y docker-compose-plugin
```

## 3. Clonar o repositório

```bash
git clone <url-do-repositorio> project-manager
cd project-manager
```

## 4. Configurar variáveis de ambiente

```bash
cp .env.docker.example .env
```

Edite `.env`:

```env
CORS_ORIGIN=http://SEU_IP_DO_DROPLET
NEXT_PUBLIC_API_URL=
OLLAMA_MODEL=llama3.2
HTTP_PORT=80
```

- **`CORS_ORIGIN`**: URL pública de acesso (IP ou domínio).
- **`NEXT_PUBLIC_API_URL`**: deixe vazio para que o frontend chame a API pela mesma origem (`/projects`), roteada pelo nginx.
- **`OLLAMA_MODEL`**: modelo baixado automaticamente na primeira subida.

## 5. Subir a aplicação

```bash
docker compose up -d --build
```

Na primeira execução, o serviço `ollama-init` baixa o modelo (pode levar alguns minutos).

Acompanhe os logs:

```bash
docker compose logs -f
```

## 6. Verificar

- Frontend: `http://SEU_IP_DO_DROPLET`
- Swagger: `http://SEU_IP_DO_DROPLET/docs`
- Health da API: `http://SEU_IP_DO_DROPLET/health`

## 7. Firewall (recomendado)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```

Não exponha a porta `11434` do Ollama publicamente; ela fica apenas na rede interna do Docker.

## Comandos úteis

```bash
# Parar a stack
docker compose down

# Rebuild após atualização do código
docker compose up -d --build

# Ver status dos containers
docker compose ps

# Entrar no container da API (debug)
docker compose exec api sh
```

## Domínio personalizado (opcional)

1. Aponte o registro A do domínio para o IP do droplet.
2. Atualize `CORS_ORIGIN` no `.env` para `http://seu-dominio.com`.
3. Rebuild do web (a variável é embutida no build):

```bash
docker compose up -d --build web
```

Para HTTPS, adicione um proxy com Certbot (Caddy, Traefik ou nginx + Let's Encrypt) na frente do compose.

## Desenvolvimento local com Docker

```bash
cp .env.docker.example .env
# Para acesso local:
# CORS_ORIGIN=http://localhost
# NEXT_PUBLIC_API_URL=

docker compose up -d --build
```

Acesse `http://localhost`.

## Desenvolvimento local sem Docker

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Suba o Ollama localmente (https://ollama.com)
ollama pull llama3.2
ollama serve

npm run db:migrate --workspace=api
npm run dev
```
