# Estrategia de testes com VADER e Cypress

A suite de testes da `runner_API` foi organizada usando a heuristica VADER, apresentada na mentoria do Julio de Lima para testes de API:

- **V - Verbs**: exercitar os principais verbos HTTP e contratos basicos de cada endpoint.
- **A - Authorization**: validar autenticacao, token, papeis e isolamento de acesso.
- **D - Data**: variar massas de dados, combinacoes de treino e regras de negocio.
- **E - Errors**: provocar erros esperados e validar status code/mensagens.
- **R - Responsiveness**: observar tempo de resposta e disponibilidade basica dos endpoints.

## Ferramenta

Os testes foram escritos em **JavaScript** com **Cypress**, usando `cy.request` para testar a API.

## Estrutura

```text
cypress/
  e2e/
    api/
      vader/
        authorization.cy.js
        data.cy.js
        errors.cy.js
        responsiveness.cy.js
        verbs.cy.js
  fixtures/
    prescription.json
  support/
    e2e.js
cypress.config.js
```

## Pre-requisitos

A API precisa estar rodando antes da execucao dos testes.

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Como executar

Em outro terminal, rode:

```bash
npm test
```

Ou apenas os testes de API:

```bash
npm run test:api
```

Para abrir o Cypress em modo interativo:

```bash
npm run test:open
```

## Variaveis de ambiente do Cypress

Por padrao, os testes usam a API em `http://localhost:3333` e os usuarios criados pelo seed.

Voce pode sobrescrever:

```bash
CYPRESS_API_URL=http://localhost:3333 npm run test:api
```

Variaveis aceitas:

- `CYPRESS_API_URL`
- `CYPRESS_PROFESSOR_EMAIL`
- `CYPRESS_PROFESSOR_PASSWORD`
- `CYPRESS_ALUNO_EMAIL`
- `CYPRESS_ALUNO_PASSWORD`

## Cobertura por letra da VADER

### Verbs

Arquivo: `cypress/e2e/api/vader/verbs.cy.js`

Cobre:

- `GET /health`
- `POST /auth/login`
- `GET /workout-groups`
- `POST /students`
- `PATCH /students/{studentId}`

### Authorization

Arquivo: `cypress/e2e/api/vader/authorization.cy.js`

Cobre:

- Rota protegida sem token.
- Token invalido.
- Aluno tentando acessar rota de professor.
- Aluno tentando criar prescricao.
- Professor tentando registrar treino como aluno.

### Data

Arquivo: `cypress/e2e/api/vader/data.cy.js`

Cobre:

- Combinacao educativo + ativacao + corrida.
- Restricao para corrida intensa + fortalecimento pesado de inferiores.
- Sobrescrita de restricao com justificativa.
- Registro de treino concluido pelo aluno.

### Errors

Arquivo: `cypress/e2e/api/vader/errors.cy.js`

Cobre:

- Login invalido.
- Payload invalido.
- Recurso inexistente.
- Prescricao sem itens.
- Rota inexistente.

### Responsiveness

Arquivo: `cypress/e2e/api/vader/responsiveness.cy.js`

Cobre:

- Tempo de resposta de `/health`.
- Tempo de resposta do login.
- Tempo de resposta do catalogo de treinos.
- Disponibilidade do contrato OpenAPI.

## Observacoes

- Os testes criam alunos dinamicamente para evitar dependencia forte de massa compartilhada.
- O seed ainda e necessario para criar professor demo, aluno demo e catalogo inicial.
- Os testes antigos em TypeScript/Vitest foram removidos para manter foco total em Cypress + JavaScript.
