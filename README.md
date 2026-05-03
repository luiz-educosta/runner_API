# runner_API

API de controle de exercicios para corredores.

## Objetivo

Criar uma API para que professores possam prescrever, acompanhar e revisar treinos de corrida dos seus alunos, com registro de execucao pelo aluno e regras simples para evitar sobrecarga.

## Stack

- Node.js
- TypeScript
- Express
- Prisma
- SQLite
- JWT
- Swagger/OpenAPI
- Cypress com JavaScript para testes de API

## Como executar

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

No Windows PowerShell, use `Copy-Item .env.example .env` no lugar de `cp`.

A API sobe em `http://localhost:3333`.

## Swagger

- Swagger UI: `http://localhost:3333/docs`
- OpenAPI JSON: `http://localhost:3333/openapi.json`

## Testes

Os testes foram reestruturados em Cypress + JavaScript usando a heuristica VADER:

- Verbs
- Authorization
- Data
- Errors
- Responsiveness

Com a API rodando, execute:

```bash
npm run test:api
```

Para abrir o Cypress em modo interativo:

```bash
npm run test:open
```

Documentacao da estrategia: [docs/tests-vader.md](docs/tests-vader.md)

## Usuarios demo

Apos executar o seed:

- Professor: `professor@example.com` / `123456`
- Aluno: `aluno@example.com` / `123456`

## Funcionalidades implementadas

- Login de professor e aluno com JWT.
- Autorizacao por papel: `teacher` e `student`.
- Cadastro, listagem, detalhe, edicao e historico de alunos.
- Catalogo de grupos e tipos de treino para corrida.
- Prescricao de treinos por data.
- Validacao de combinacao para evitar sobrecarga.
- Registro de treino concluido pelo aluno.
- Registro de duracao, distancia, pace, RPE, dor, fadiga e dificuldade.
- Painel do professor para treinos concluidos, nao realizados e alertas.
- Swagger e documentacao inicial.
- Suite Cypress de testes de API baseada em VADER.

## Documentacao

- Guia de execucao e endpoints: [docs/api.md](docs/api.md)
- Estrategia de testes VADER: [docs/tests-vader.md](docs/tests-vader.md)
- Documentacao inicial em formato de Wiki: [docs/wiki/Home.md](docs/wiki/Home.md)

## Epico e planejamento

- Epico principal: #1
- User stories: #2 a #33
