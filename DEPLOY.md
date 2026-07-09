# Deploy em droplet DigitalOcean

Stack: **Caddy (porta 8080)** + web + api + Ollama + SQLite.

> Se o droplet já usa as portas **80/443** para outra aplicação, este projeto sobe na **8080** sem alterar a outra app.

**Requisitos:** Ubuntu 22.04+, 4 GB RAM, 2 vCPUs, porta **8080** aberta.

## Passo a passo

### 1. DNS

Registro **A** de `projectmanager` → IP do droplet.

### 2. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 8080/tcp
sudo ufw enable
```

(Não é necessário liberar 80/443 para este app.)

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
CORS_ORIGIN=http://projectmanager.semtrip.com:8080
NEXT_PUBLIC_API_URL=
OLLAMA_MODEL=llama3.2
CADDY_HTTP_PORT=8080
```

### 5. Subir

```bash
docker compose up -d --build
docker compose ps
```

### 6. Acessar

- App: `http://projectmanager.semtrip.com:8080`
- Swagger: `http://projectmanager.semtrip.com:8080/docs`
- Health: `http://projectmanager.semtrip.com:8080/health`

## Convivência com outra app na 80/443

A outra aplicação continua em `https://seu-outro-dominio.com` (portas 80/443).

Este projeto responde **somente na porta 8080**. Acessar `https://projectmanager.semtrip.com` (sem `:8080`) ainda cai na outra app — use sempre **`:8080`**.

## Comandos úteis

```bash
docker compose ps
docker compose down
docker compose up -d --build
docker compose logs -f caddy
```

## Droplet com 2 GB RAM

Use `OLLAMA_MODEL=llama3.2:1b` no `.env`.
