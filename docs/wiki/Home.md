# runner_API - Documentacao Inicial

## Visao geral

A `runner_API` e uma API para controle de exercicios de corredores. O sistema permite que professores acompanhem alunos, prescrevam treinos, consultem historico de execucao e recebam sinais simples de alerta sobre sobrecarga, dor ou fadiga.

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

## Regras iniciais de combinacao

### Permitidas

- Educativo + ativacao + corrida.
- Mobilidade + fortalecimento, desde que a carga total esteja adequada.
- Ativacao leve antes de treinos de corrida.
- Mobilidade em dias de treino leve ou fortalecimento controlado.

### Com alerta ou restricao

- Corrida intensa + fortalecimento pesado no mesmo dia.
- Corrida intensa + fortalecimento pesado de membros inferiores.
- Treino longo + fortalecimento intenso.
- Teste de VO2Max ou teste de pace + treino de alta carga adicional.

### Sobrescrita pelo professor

O professor podera sobrescrever determinadas restricoes com justificativa obrigatoria. Essa decisao deve ficar registrada na prescricao.

## Classificacao de carga

Cada treino deve possuir classificacao inicial de carga:

- `leve`
- `moderada`
- `intensa`

Essa classificacao sera usada para validar combinacoes de treino e emitir alertas de sobrecarga.

## Entidades iniciais sugeridas

### User

Representa credenciais e perfil de acesso.

Campos sugeridos:

- `id`
- `name`
- `email`
- `password_hash`
- `role`: `student` ou `teacher`
- `created_at`
- `updated_at`

### StudentProfile

Representa dados esportivos do aluno.

Campos sugeridos:

- `id`
- `user_id`
- `teacher_id`
- `birth_date`
- `level`
- `goal`
- `active`

### WorkoutGroup

Representa os grupos principais de treino.

Campos sugeridos:

- `id`
- `name`
- `description`

### WorkoutType

Representa os subtipos de treino.

Campos sugeridos:

- `id`
- `group_id`
- `name`
- `description`
- `default_load_level`
- `is_assessment`
- `active`

### Prescription

Representa uma prescricao de treino para um aluno em uma data.

Campos sugeridos:

- `id`
- `teacher_id`
- `student_id`
- `scheduled_date`
- `status`
- `created_at`
- `updated_at`

### PrescriptionItem

Representa cada item de treino dentro da prescricao.

Campos sugeridos:

- `id`
- `prescription_id`
- `workout_type_id`
- `load_level`
- `duration_minutes`
- `distance_km`
- `intensity_notes`
- `objective`
- `notes`

### WorkoutLog

Representa o registro feito pelo aluno apos executar o treino.

Campos sugeridos:

- `id`
- `prescription_item_id`
- `student_id`
- `completed_at`
- `duration_minutes`
- `distance_km`
- `pace`
- `rpe`
- `pain_level`
- `fatigue_level`
- `difficulty_level`
- `notes`

### CombinationWarning

Representa alertas gerados por combinacao de treinos.

Campos sugeridos:

- `id`
- `prescription_id`
- `type`
- `message`
- `severity`
- `overridden`
- `override_reason`

## Endpoints iniciais sugeridos

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
- `POST /prescriptions/{prescriptionId}/validate-combination`

### Registro de treinos

- `GET /me/prescriptions`
- `POST /workout-logs`
- `PATCH /workout-logs/{workoutLogId}`

### Acompanhamento

- `GET /teacher/workout-logs`
- `GET /teacher/missed-workouts`
- `GET /teacher/alerts`

## MVP

1. Login de professor e aluno.
2. Cadastro e vinculo de alunos.
3. Catalogo inicial de grupos e tipos de treino.
4. Professor prescreve treinos.
5. Aluno marca treino como concluido.
6. Professor visualiza historico dos alunos.
7. Regras simples de combinacao para evitar sobrecarga.

## Planejamento no GitHub

- Epico principal: #1
- User stories: #2 a #33
