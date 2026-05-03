# Guia de execucao da runner_API

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Configuracao local

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Gere o Prisma Client:

```bash
npm run prisma:generate
```

4. Crie o banco SQLite com as migrations:

```bash
npm run prisma:migrate -- --name init
```

5. Popule usuarios demo e catalogo inicial:

```bash
npm run prisma:seed
```

6. Suba a API em modo desenvolvimento:

```bash
npm run dev
```

A API ficara disponivel em `http://localhost:3333`.

## Swagger

Com a API em execucao, acesse:

- Swagger UI: `http://localhost:3333/docs`
- OpenAPI JSON: `http://localhost:3333/openapi.json`

## Health check

```bash
curl http://localhost:3333/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

## Usuarios demo

Apos executar o seed:

- Professor: `professor@example.com` / `123456`
- Aluno: `aluno@example.com` / `123456`

## Fluxo rapido para testar

1. Login como professor em `POST /auth/login`.
2. Use o token JWT no header `Authorization: Bearer <token>`.
3. Liste `GET /workout-types` para obter os IDs dos treinos.
4. Liste `GET /students` para obter o ID do aluno demo.
5. Crie uma prescricao em `POST /prescriptions`.
6. Login como aluno.
7. Consulte `GET /me/prescriptions`.
8. Registre conclusao em `POST /workout-logs`.
9. Login como professor e consulte `GET /teacher/workout-logs` e `GET /teacher/alerts`.

## Exemplo de login

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@example.com","password":"123456"}'
```

## Exemplo de prescricao

```json
{
  "studentId": "id-do-aluno",
  "scheduledDate": "2026-05-04",
  "items": [
    {
      "workoutTypeId": "id-do-treino",
      "loadLevel": "leve",
      "durationMinutes": 40,
      "objective": "Rodagem leve com foco em constancia"
    }
  ]
}
```

## Regras de combinacao implementadas

- Educativo + ativacao + corrida gera informacao positiva.
- Mobilidade + fortalecimento e permitido, com alerta se a carga for pesada.
- Corrida intensa + fortalecimento pesado gera alerta.
- Corrida intensa + fortalecimento pesado de inferiores gera restricao e exige `overrideReason`.
- Avaliacao, como VO2Max ou teste de pace, com carga extra gera alerta.

## Scripts

- `npm run dev`: executa em desenvolvimento.
- `npm run build`: compila TypeScript.
- `npm start`: executa codigo compilado.
- `npm run prisma:generate`: gera Prisma Client.
- `npm run prisma:migrate -- --name init`: cria/aplica migration local.
- `npm run prisma:seed`: popula dados iniciais.
- `npm test`: executa testes unitarios.
