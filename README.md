# Sistema de Gestão de Projetos

Aplicação fullstack para gerenciamento simplificado de projetos de uma empresa: cadastro, consulta, edição, remoção, controle de status e cálculo automático de risco, com uma análise textual gerada com apoio de Inteligência Artificial.

- **Frontend**: React (Next.js/App Router) + TypeScript
- **Backend**: Node.js com NestJS + TypeScript
- **Banco de dados**: SQLite via Prisma (zero configuração, arquivo local)
- **Monorepo**: Turborepo (npm workspaces)

> Consulte [`AI_USAGE.md`](AI_USAGE.md) para o detalhamento do uso de IA na construção deste projeto.

## Estrutura do repositório

```
apps/
  api/            API NestJS (regras de negocio, Prisma, analise com IA, Swagger)
  web/            Frontend Next.js (listagem, formulario, detalhe, analise com IA)
packages/
  shared-types/   Enums, contratos e maquina de estados compartilhados entre api e web
  eslint-config/  Configuracoes de lint reutilizadas pelos apps
  typescript-config/ tsconfigs base reutilizados pelos apps/packages
```

## Pré-requisitos

- Node.js 20+ (recomendado 22, usado no desenvolvimento)
- npm 10+

## Instalação e execução

```bash
# 1. instalar dependencias de todo o monorepo
npm install

# 2. configurar variaveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. criar o banco SQLite e aplicar as migrations
npm run db:migrate --workspace=api

# 4. subir api (http://localhost:3001) e web (http://localhost:3000) juntos
npm run dev
```

Para rodar cada app isoladamente: `npm run dev --workspace=api` ou `npm run dev --workspace=web`.

Documentação interativa da API (Swagger): **http://localhost:3001/docs**.

### Variáveis de ambiente

**`apps/api/.env`**

| Variável | Descrição | Default |
| --- | --- | --- |
| `PORT` | Porta da API | `3001` |
| `DATABASE_URL` | Conexão SQLite (arquivo local) | `file:./dev.db` |
| `CORS_ORIGIN` | Origem permitida para o frontend | `http://localhost:3000` |
| `AI_PROVIDER` | `ollama` (local) ou `mock` (simulado) | `mock` |
| `OLLAMA_BASE_URL` | URL base do Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modelo usado na análise | `llama3.2` |

Se `AI_PROVIDER=ollama` mas o Ollama não estiver acessível, a requisição de análise falhará com erro HTTP (ver seção [Análise com IA](#análise-com-ia)).

**`apps/web/.env.local`**

| Variável | Descrição | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base da API | `http://localhost:3001` |

Nenhuma chave/segredo é versionado no repositório; apenas os arquivos `.env.example` (sem valores sensíveis).

## Regras de negócio

### Status do projeto

Todo projeto é criado com status **Em análise**. A transição segue uma máquina de estados fixa:

```
Em análise → Aprovado → Em andamento → Encerrado
Em análise, Aprovado ou Em andamento → Cancelado
```

Não é permitido pular etapas. `Encerrado` e `Cancelado` são estados terminais (nenhuma transição posterior é permitida). Projetos com status `Em andamento` ou `Encerrado` não podem ser removidos.

### Cálculo automático de risco

Calculado a partir do orçamento e do prazo (diferença entre data de início e previsão de término), e recalculado sempre que qualquer um desses três campos é criado/alterado:

| Regra | Baixo | Médio | Alto |
| --- | --- | --- | --- |
| Orçamento | até R$ 100.000 | R$ 100.001 – R$ 500.000 | acima de R$ 500.000 |
| Prazo | até 3 meses | 3–6 meses | acima de 6 meses |

Quando as duas regras discordam, **prevalece o maior risco**.

## Análise com IA

`GET /projects/:id/ai-analysis` retorna um resumo, pontos de atenção e uma recomendação executiva sobre o projeto.

A chamada ao provedor de IA está isolada em camadas próprias (nunca no controller):

- `ProjectAnalysisPromptBuilder`: monta o prompt a partir dos dados do projeto.
- `AiClient` (interface): porta que qualquer provedor deve implementar.
- `OllamaClient`: implementação real, via API HTTP do Ollama (`/api/chat` com `format: json`).
- `MockAiClient`: implementação simulada (sem custo/rede), usada quando `AI_PROVIDER=mock` e nos testes automatizados.
- `AiAnalysisService`: orquestra as peças acima e normaliza a resposta, com fallback textual caso o modelo não retorne um JSON válido.

Para usar a integração real, defina `AI_PROVIDER=ollama` e suba o Ollama (`ollama serve` localmente ou via Docker Compose).

## Docker e deploy (DigitalOcean)

A stack completa (Caddy + web + api + Ollama + SQLite persistente) pode ser executada com Docker Compose:

```bash
cp .env.docker.example .env
# edite DOMAIN, ACME_EMAIL e CORS_ORIGIN com seu domínio
npm run docker:up
```

Consulte [`DEPLOY.md`](DEPLOY.md) para o passo a passo completo em um droplet DigitalOcean.

## Testes

```bash
# testes unitarios (api e web)
npm run test

# testes de integracao (e2e) da api, endpoint a endpoint
npm run test:e2e --workspace=api
```

- **Backend**: Jest. Unitários para `RiskCalculatorService`, `StatusTransitionValidator`, `ProjectsService`, `AiAnalysisService` e o filtro global de erros; e2e (supertest) cobrindo os 7 endpoints com um banco SQLite dedicado a testes.
- **Frontend**: Vitest + React Testing Library + MSW, cobrindo `StatusBadge`/`RiskBadge`, `StatusActions`, `AiAnalysisPanel` e `ProjectFormModal`.

## Decisões técnicas e premissas assumidas

- **Duração em meses**: calculada com `date-fns#differenceInMonths` (meses cheios de calendário, ex.: 01/01 → 01/04 = 3 meses), pois a regra de negócio não especifica o método exato.
- **Orçamento como `Float`**: o provider SQLite do Prisma tem suporte limitado a `Decimal`; em um cenário de produção com outro banco, `Decimal`/valores em centavos seriam preferíveis para evitar imprecisão de ponto flutuante.
- **Status/risco armazenados como `String` no banco**: o SQLite não possui enum nativo; os valores válidos são garantidos pela aplicação (`class-validator` + `@repo/shared-types`), não por uma constraint do banco.
- **Estados terminais**: `Encerrado` e `Cancelado` não permitem nenhuma transição posterior (extensão razoável da regra "qualquer status → Cancelado").
- **Modelo de IA padrão**: `llama3.2` via Ollama, executável localmente ou em container Docker.
- **Sem autenticação, paginação avançada ou filtros complexos**: fora do escopo do desafio.

## Scripts principais (raiz)

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe api + web em modo desenvolvimento |
| `npm run build` | Builda todos os apps/pacotes |
| `npm run lint` | Lint em todo o monorepo |
| `npm run check-types` | Checagem de tipos em todo o monorepo |
| `npm run test` | Testes unitários de api e web |
| `npm run docker:up` | Sobe a stack completa com Docker Compose |
| `npm run docker:down` | Para e remove os containers |
