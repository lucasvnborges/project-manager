# Uso de Inteligência Artificial no desenvolvimento

Este documento descreve como a IA foi utilizada na construção deste projeto: em quais etapas, quais decisões técnicas foram tomadas de forma deliberada e quais são as limitações da entrega.

## Ferramenta e modelo utilizados

- **Ferramenta**: [Cursor](https://cursor.com) em modo agente (acesso a terminal, leitura/escrita de arquivos, browser automatizado para validação visual).
- **Modelo**: Claude (Sonnet), via Cursor.

## Como o projeto foi conduzido

O desenvolvimento foi estruturado em etapas sequenciais, cada uma orientada e revisada antes de avançar para a próxima:

1. **Planejamento e arquitetura**: definição da estrutura de pastas, camadas do backend, contratos compartilhados, design system e sequência de commits, em modo de planejamento (sem edição de arquivos), antes de qualquer código ser escrito.
2. **Backend (NestJS)**: implementação das camadas (controller/service/repository), regras de negócio (cálculo de risco, máquina de estados, bloqueio de exclusão/edição), DTOs/validação, tratamento de erros, a feature de análise com IA (prompt builder, `AiClient`/`OllamaClient`/`MockAiClient`, `AiAnalysisService`) e testes (unitários e e2e).
3. **Frontend (Next.js)**: design system (tokens Tailwind), componentes de UI, listagem/formulário/detalhe de projetos, integração com a API via TanStack Query, e testes de componentes (Vitest + RTL + MSW).
4. **Infraestrutura**: containerização com Docker Compose (api, web, Ollama, Caddy) e preparação para deploy em droplet.
5. **Refinamentos**: ajustes pontuais de UX, revisão de texto e correções reportadas ao longo do uso.
6. **Documentação**: este arquivo e o `README.md`.

Cada etapa foi acompanhada de revisão do resultado (leitura do código gerado, execução de build/lint/testes e validação visual dos fluxos principais) antes de seguir para a próxima.

## O que foi aceito, ajustado ou descartado

**Aceito diretamente:**
- Estrutura de camadas do backend (`controller → service → repository`) e a separação da análise com IA em `ProjectAnalysisPromptBuilder` / `AiClient` / `AiAnalysisService`.
- Máquina de estados de status centralizada em `@repo/shared-types`, reaproveitada tanto no backend (validação) quanto no frontend (habilitar/desabilitar ações).
- Tokens de design (cores, tipografia, espaçamento) definidos via `@theme` do Tailwind v4.

**Ajustado após revisão/erro encontrado:**
- O gerador padrão de enum do Prisma foi trocado por campos `String` no schema, pois o provider SQLite não suporta enum nativo; os valores válidos passaram a ser garantidos apenas na camada de aplicação (`class-validator` + `@repo/shared-types`). Essa troca foi decidida e documentada como premissa no README.
- A dependência `@hookform/resolvers` foi removida do frontend após um erro de tipos em tempo de build causado por incompatibilidade entre sua versão mais recente e a versão mais recente do `zod` disponível; foi escrito um adaptador próprio e minimalista (`lib/validation/zod-resolver.ts`) para não depender dessa combinação de versões.
- A integração de IA foi migrada de um provedor externo (OpenAI) para Ollama, permitindo execução local/self-hosted sem dependência de chave de API paga.

**Descartado:**
- Um design inicial que usava o gerador `prisma-client` (ESM, com diretório de saída customizado) foi descartado em favor do gerador clássico `prisma-client-js`, mais simples de integrar com o restante do NestJS/Jest neste projeto.

## Decisões técnicas tomadas pelo candidato

- **Monorepo Turborepo** (em vez de dois repositórios/pastas isoladas), para compartilhar tipos e a máquina de estados entre backend e frontend via `@repo/shared-types` sem duplicação.
- **SQLite + Prisma** como banco de dados, priorizando "zero configuração" para quem for rodar o projeto localmente, com a documentação explícita das limitações dessa escolha (sem `Decimal` nativo, sem enum nativo).
- **Integração de IA via Ollama**, permitindo geração de análises textuais sem custo de API externo, com fallback automático para uma implementação mock quando o serviço não está disponível (`AI_PROVIDER`).
- **Cálculo de duração em meses cheios de calendário** (`date-fns#differenceInMonths`) como interpretação explícita e documentada da regra de negócio, que não especifica o método exato de cálculo do prazo.
- **Testes**: cobertura das regras de negócio centrais (cálculo de risco, transição de status, bloqueio de exclusão/edição, análise com IA) tanto no backend quanto nos componentes principais do frontend, priorizadas sobre cobertura ampla e superficial.

## Limitações da entrega

- Sem autenticação, controle de permissões, paginação avançada ou filtros complexos — fora do escopo definido pelo desafio.
- Orçamento armazenado como `Float` (não `Decimal`), por limitação do provider SQLite do Prisma; um ambiente de produção real deveria usar `Decimal`/valores em centavos.
- A cobertura de testes é focada nas regras de negócio centrais e nos componentes/integrações mais relevantes, não sendo uma suíte exaustiva.
- O código foi revisado, executado (build/lint/testes) e validado visualmente a cada etapa antes de ser incorporado ao projeto.
