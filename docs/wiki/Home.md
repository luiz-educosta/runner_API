# runner_API - Documentacao Inicial

## Visao geral

A `runner_API` e uma API para controle de exercicios de corredores. O sistema permite que professores acompanhem alunos, prescrevam treinos, consultem historico de execucao e recebam sinais simples de alerta sobre sobrecarga, dor ou fadiga.

## Status da implementacao

O MVP foi implementado em Node.js com TypeScript, Express, Prisma, SQLite, JWT e Swagger/OpenAPI.

Documentos complementares:

- Guia de execucao: `docs/api.md`
- Swagger local: `http://localhost:3333/docs`
- OpenAPI JSON: `http://localhost:3333/openapi.json`

## Perfis de usuario

### Professor

Responsavel por cadastrar alunos, consultar historico, prescrever treinos, analisar registros feitos pelos alunos e acompanhar sinais de alerta.

### Aluno

Responsavel por consultar os treinos prescritos, marcar treinos como concluidos e informar dados de execucao, percepcao de esforco, dor, fadiga e observacoes.

## Grupos de treino

### Corrida

- Rodagem leve
- Rodagem normal
- Treino longo
- Fartlek
- Treino intervalado/tiro
- Treino de ritmo/tempo run
- Regenerativo
- Teste de VO2Max
- Teste de pace/distancia, como 3 km, 5 km ou 12 minutos

### Fortalecimento

- Inferiores
- Superiores
- Core
- Full body
- Forca especifica para corrida

### Mobilidade

- Mobilidade geral
- Mobilidade focada para corrida
- Mobilidade de quadril, tornozelo e cadeia posterior

### Ativacao muscular

- Ativacao de membros inferiores
- Ativacao de core
- Ativacao de gluteos
- Ativacao de musculos importantes para corrida
- Ativacao de membros superiores como apoio opcional

### Educativos de corrida

- Drills de tecnica
- Coordenacao motora
- Cadencia
- Postura
- Eficiencia de passada

## Regras de combinacao implementadas

### Permitidas

- Educativo + ativacao + corrida.
- Mobilidade + fortalecimento, desde que a carga total esteja adequada.
- Ativacao leve antes de treinos de corrida.
- Mobilidade em dias de treino leve ou fortalecimento controlado.

### Com alerta ou restricao

- Corrida intensa + fortalecimento pesado no mesmo dia.
- Corrida intensa + fortalecimento pesado de membros inferiores.
- Teste de VO2Max ou teste de pace + treino de alta carga adicional.

### Sobrescrita pelo professor

Restricoes podem ser sobrescritas com `overrideReason`. A justificativa fica registrada em `CombinationWarning`.

## Classificacao de carga

Cada treino possui classificacao inicial de carga:

- `leve`
- `moderada`
- `intensa`

Essa classificacao e usada para validar combinacoes de treino e emitir alertas de sobrecarga.

## Entidades implementadas

- `User`
- `StudentProfile`
- `WorkoutGroup`
- `WorkoutType`
- `Prescription`
- `PrescriptionItem`
- `WorkoutLog`
- `CombinationWarning`

## Endpoints implementados

### Autenticacao

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Alunos

- `POST /students`
- `GET /students`
- `GET /students/{studentId}`
- `PATCH /students/{studentId}`
- `GET /students/{studentId}/history`

### Catalogo de treinos

- `GET /workout-groups`
- `GET /workout-types`
- `POST /workout-types`
- `PATCH /workout-types/{workoutTypeId}`

### Prescricoes

- `POST /prescriptions`
- `GET /prescriptions`
- `GET /prescriptions/{prescriptionId}`
- `PATCH /prescriptions/{prescriptionId}`
- `POST /prescriptions/validate-combination`

### Registro de treinos

- `GET /me/prescriptions`
- `POST /workout-logs`
- `PATCH /workout-logs/{workoutLogId}`

### Acompanhamento

- `GET /teacher/workout-logs`
- `GET /teacher/missed-workouts`
- `GET /teacher/alerts`

## MVP entregue

1. Login de professor e aluno.
2. Cadastro e vinculo de alunos.
3. Catalogo inicial de grupos e tipos de treino.
4. Professor prescreve treinos.
5. Aluno marca treino como concluido.
6. Professor visualiza historico dos alunos.
7. Regras simples de combinacao para evitar sobrecarga.
8. Swagger e guia de execucao.
9. Testes unitarios das regras de combinacao.

## Planejamento no GitHub

- Epico principal: #1
- User stories: #2 a #33
