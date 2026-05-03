export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "runner_API",
    version: "0.1.0",
    description: "API para controle de exercicios de corredores, com professores, alunos, prescricoes, registros e alertas de sobrecarga."
  },
  servers: [{ url: "http://localhost:3333" }],
  tags: [
    { name: "Auth" },
    { name: "Students" },
    { name: "Workout catalog" },
    { name: "Prescriptions" },
    { name: "Workout logs" },
    { name: "Teacher dashboard" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "API online" } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica aluno ou professor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { email: "professor@example.com", password: "123456" }
            }
          }
        },
        responses: { "200": { description: "Token JWT gerado" }, "401": { description: "Credenciais invalidas" } }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Retorna usuario autenticado",
        responses: { "200": { description: "Usuario autenticado" } }
      }
    },
    "/students": {
      get: {
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        summary: "Lista alunos do professor autenticado",
        responses: { "200": { description: "Lista de alunos" } }
      },
      post: {
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        summary: "Cadastra aluno vinculado ao professor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Aluno Demo", email: "aluno@example.com", password: "123456", level: "iniciante", goal: "5 km" }
            }
          }
        },
        responses: { "201": { description: "Aluno criado" } }
      }
    },
    "/workout-groups": {
      get: {
        tags: ["Workout catalog"],
        security: [{ bearerAuth: [] }],
        summary: "Lista grupos de treino",
        responses: { "200": { description: "Grupos de treino" } }
      }
    },
    "/workout-types": {
      get: {
        tags: ["Workout catalog"],
        security: [{ bearerAuth: [] }],
        summary: "Lista tipos de treino",
        responses: { "200": { description: "Tipos de treino" } }
      },
      post: {
        tags: ["Workout catalog"],
        security: [{ bearerAuth: [] }],
        summary: "Cria tipo de treino",
        responses: { "201": { description: "Tipo criado" } }
      }
    },
    "/prescriptions": {
      get: {
        tags: ["Prescriptions"],
        security: [{ bearerAuth: [] }],
        summary: "Lista prescricoes conforme perfil autenticado",
        responses: { "200": { description: "Prescricoes" } }
      },
      post: {
        tags: ["Prescriptions"],
        security: [{ bearerAuth: [] }],
        summary: "Cria prescricao para aluno",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                studentId: "student-user-id",
                scheduledDate: "2026-05-04",
                overrideReason: "Ajuste supervisionado pelo professor.",
                items: [{ workoutTypeId: "workout-type-id", loadLevel: "leve", durationMinutes: 40, objective: "Rodagem leve" }]
              }
            }
          }
        },
        responses: { "201": { description: "Prescricao criada" } }
      }
    },
    "/prescriptions/validate-combination": {
      post: {
        tags: ["Prescriptions"],
        security: [{ bearerAuth: [] }],
        summary: "Valida combinacao de treinos antes de salvar",
        responses: { "200": { description: "Alertas da combinacao" } }
      }
    },
    "/me/prescriptions": {
      get: {
        tags: ["Workout logs"],
        security: [{ bearerAuth: [] }],
        summary: "Aluno lista seus treinos prescritos",
        responses: { "200": { description: "Treinos do aluno" } }
      }
    },
    "/workout-logs": {
      post: {
        tags: ["Workout logs"],
        security: [{ bearerAuth: [] }],
        summary: "Aluno registra treino concluido",
        responses: { "201": { description: "Registro criado" } }
      }
    },
    "/teacher/workout-logs": {
      get: {
        tags: ["Teacher dashboard"],
        security: [{ bearerAuth: [] }],
        summary: "Professor lista treinos concluidos dos alunos",
        responses: { "200": { description: "Registros de treino" } }
      }
    },
    "/teacher/missed-workouts": {
      get: {
        tags: ["Teacher dashboard"],
        security: [{ bearerAuth: [] }],
        summary: "Professor lista treinos nao realizados",
        responses: { "200": { description: "Treinos vencidos sem conclusao" } }
      }
    },
    "/teacher/alerts": {
      get: {
        tags: ["Teacher dashboard"],
        security: [{ bearerAuth: [] }],
        summary: "Professor lista alertas de dor, fadiga e combinacao",
        responses: { "200": { description: "Alertas" } }
      }
    }
  }
};
