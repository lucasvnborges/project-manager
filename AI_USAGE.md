# Uso de Inteligência Artificial no desenvolvimento

Este documento descreve, de forma transparente, como IA foi utilizada na construção deste projeto: qual ferramenta, em quais partes, quais prompts guiaram o trabalho, o que foi aceito/ajustado/descartado, quais decisões técnicas foram tomadas de forma deliberada e quais são as limitações da entrega.

## Ferramenta e modelo utilizados

- **Ferramenta**: [Cursor](https://cursor.com) em modo agente (acesso a terminal, leitura/escrita de arquivos, browser automatizado para validação visual).
- **Modelo**: Claude (Sonnet), via Cursor.

## Para quais partes do desafio a IA foi utilizada

A IA foi usada de ponta a ponta neste projeto, sempre sob direção e revisão explícitas:

1. **Planejamento e arquitetura**: elaboração do plano técnico completo (estrutura de pastas, camadas do backend, contratos compartilhados, design system, sequência de commits) em modo de planejamento do Cursor, antes de qualquer código ser escrito.
2. **Backend (NestJS)**: implementação de todas as camadas (controller/service/repository), regras de negócio (cálculo de risco, máquina de estados, bloqueio de exclusão), DTOs/validação, tratamento de erros, a feature de análise com IA (prompt builder, `AiClient`/`OpenAiClient`/`MockAiClient`, `AiAnalysisService`) e testes (unitários e e2e).
3. **Frontend (Next.js)**: design system (tokens Tailwind), componentes de UI, listagem/formulário/detalhe de projetos, integração com a API via TanStack Query, e testes de componentes (Vitest + RTL + MSW).
4. **Documentação**: este arquivo e o `README.md`.

## Prompts principais utilizados

Os prompts abaixo (resumidos/traduzidos do fluxo real de conversa) guiaram as etapas principais:

1. *"Crie o melhor plano possível para desenvolver o seguinte teste técnico. Considere conventional commits em português por etapas utilizando roles agentes senior em planejamento, arquitetura, desenvolvimento, ui/ux e QA. Commits pequenos em etapas e testes para as principais features e integrações: [...colar do desafio original...]"* — usado em **modo de planejamento** (sem edição de arquivos) para produzir a arquitetura e a sequência de commits antes de qualquer implementação.
2. Perguntas de esclarecimento respondidas antes do plano final: manter monorepo Turborepo (vs. estrutura simples), integração real com IA (vs. mock) e provedor (OpenAI), e persistência via SQLite + Prisma.
3. Uma instrução de direcionamento visual pedindo que a interface seguisse a linguagem de um design system de referência de mercado (fintech/SaaS moderno), sem citar essa inspiração em nenhum lugar do projeto — traduzida em tokens de design genéricos (paleta, tipografia, espaçamento) documentados no plano e implementados em `apps/web/app/globals.css`, sem qualquer referência à inspiração externa em código, nomes ou documentação.
4. *"Implement the plan as specified [...] Mark them as in_progress as you work [...] Don't stop until you have completed all the to-dos."* — execução do plano em modo agente, com todos os to-dos rastreados explicitamente.
5. *"nenhum commit deve ter 'Co-authored-by: Cursor' [...] ajuste em todos e adicione uma regra para nunca adicionar isso aos commits."* — correção de histórico e adição de salvaguardas (ver seção de limitações/decisões abaixo).

## O que foi aceito, ajustado ou descartado

**Aceito diretamente:**
- Estrutura de camadas do backend (`controller → service → repository`) e a separação da análise com IA em `ProjectAnalysisPromptBuilder` / `AiClient` / `AiAnalysisService`.
- Máquina de estados de status centralizada em `@repo/shared-types`, reaproveitada tanto no backend (validação) quanto no frontend (habilitar/desabilitar ações).
- Tokens de design (cores, tipografia, espaçamento) definidos via `@theme` do Tailwind v4.

**Ajustado após revisão/erro encontrado:**
- O gerador padrão de enum do Prisma foi trocado por campos `String` no schema, pois o provider SQLite não suporta enum nativo; os valores válidos passaram a ser garantidos apenas na camada de aplicação (`class-validator` + `@repo/shared-types`). Essa troca foi decidida e documentada como premissa no README.
- A dependência `@hookform/resolvers` foi removida do frontend após um erro de tipos em tempo de build causado por incompatibilidade entre sua versão mais recente e a versão mais recente do `zod` disponível; foi escrito um adaptador próprio e minimalista (`lib/validation/zod-resolver.ts`) para não depender dessa combinação de versões.
- O histórico de commits precisou ser reescrito (via `git filter-branch`) para remover um trailer `Co-authored-by: Cursor` que a ferramenta adicionava automaticamente às mensagens de commit, e que não deveria constar no projeto.

**Descartado:**
- A inclusão automática de trailers de coautoria de IA nas mensagens de commit foi ativamente removida (histórico limpo) e bloqueada para o restante do desenvolvimento (regra em `.cursor/rules/git-commits.mdc` e hook local `commit-msg`).
- Um design inicial que usava o gerador `prisma-client` (ESM, com diretório de saída customizado) foi descartado em favor do gerador clássico `prisma-client-js`, mais simples de integrar com o restante do NestJS/Jest neste projeto.

## Decisões técnicas tomadas pelo candidato

- **Monorepo Turborepo** (em vez de dois repositórios/pastas isoladas), para compartilhar tipos e a máquina de estados entre backend e frontend via `@repo/shared-types` sem duplicação.
- **SQLite + Prisma** como banco de dados, priorizando "zero configuração" para quem for rodar o projeto localmente, com a documentação explícita das limitações dessa escolha (sem `Decimal` nativo, sem enum nativo).
- **Integração real com IA (OpenAI)** com fallback automático para uma implementação mock quando não há chave configurada (`AI_PROVIDER`/`OPENAI_API_KEY`), permitindo que o projeto funcione, seja testado e seja avaliado mesmo sem custos de API.
- **Cálculo de duração em meses cheios de calendário** (`date-fns#differenceInMonths`) como interpretação explícita e documentada da regra de negócio, que não especifica o método exato de cálculo do prazo.
- **Testes**: cobertura das regras de negócio centrais (cálculo de risco, transição de status, bloqueio de exclusão, análise com IA) tanto no backend quanto nos componentes principais do frontend, priorizadas sobre cobertura ampla e superficial.

## Limitações da entrega

- Sem autenticação, controle de permissões, paginação avançada ou filtros complexos — fora do escopo definido pelo desafio.
- Orçamento armazenado como `Float` (não `Decimal`), por limitação do provider SQLite do Prisma; um ambiente de produção real deveria usar `Decimal`/valores em centavos.
- A integração real com a OpenAI não foi validada nesta entrega com uma chamada de rede real (nenhuma `OPENAI_API_KEY` foi configurada durante o desenvolvimento); a aplicação usa o `MockAiClient` por padrão localmente, e a implementação do `OpenAiClient` foi revisada manualmente mas depende de uma chave válida do avaliador para ser exercitada de fim a fim.
- A cobertura de testes é focada nas regras de negócio centrais e nos componentes/integrações mais relevantes, não sendo uma suíte exaustiva.
- Todo o código gerado pela IA foi lido, executado (build/lint/testes) e validado visualmente (incluindo verificação manual via automação de navegador dos fluxos de criar, editar, remover, mudar status e gerar análise) antes de cada commit, mas a revisão humana neste contexto de avaliação técnica foi feita pelo próprio autor da conversa que orientou o agente, e não por um terceiro revisor independente.
