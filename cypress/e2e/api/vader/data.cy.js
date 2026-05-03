describe("VADER - Data", () => {
  it("deve criar prescricao com educativo + ativacao + corrida e retornar alerta informativo", () => {
    cy.fixture("prescription").then((fixture) => {
      cy.loginAs("teacher").then(({ token }) => {
        cy.createStudent(token).then((student) => {
          cy.findWorkoutType(token, "Educativos de corrida", "Drills de tecnica").then((educativo) => {
            cy.findWorkoutType(token, "Ativacao muscular", "Ativacao de gluteos").then((ativacao) => {
              cy.findWorkoutType(token, "Corrida", "Rodagem leve").then((corrida) => {
                cy.api({
                  method: "POST",
                  url: "/prescriptions",
                  headers: { Authorization: `Bearer ${token}` },
                  body: {
                    studentId: student.userId,
                    scheduledDate: fixture.scheduledDate,
                    items: [
                      { workoutTypeId: educativo.id, loadLevel: "leve", durationMinutes: 10 },
                      { workoutTypeId: ativacao.id, loadLevel: "leve", durationMinutes: 10 },
                      { workoutTypeId: corrida.id, loadLevel: "leve", durationMinutes: 40, objective: fixture.runningObjective }
                    ]
                  }
                }).then((response) => {
                  expect(response.status).to.eq(201);
                  expect(response.body.items).to.have.length(3);
                  expect(response.body.warnings).to.deep.include.members([
                    Cypress.sinon.match({ type: "allowed_running_session", severity: "info" })
                  ]);
                });
              });
            });
          });
        });
      });
    });
  });

  it("deve exigir justificativa para corrida intensa com fortalecimento pesado de inferiores", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.createStudent(token).then((student) => {
        cy.findWorkoutType(token, "Corrida", "Treino intervalado/tiro").then((tiro) => {
          cy.findWorkoutType(token, "Fortalecimento", "Inferiores").then((inferiores) => {
            cy.api({
              method: "POST",
              url: "/prescriptions",
              headers: { Authorization: `Bearer ${token}` },
              body: {
                studentId: student.userId,
                scheduledDate: "2026-05-05",
                items: [
                  { workoutTypeId: tiro.id, loadLevel: "intensa", durationMinutes: 45 },
                  { workoutTypeId: inferiores.id, loadLevel: "intensa", durationMinutes: 50 }
                ]
              }
            }).then((response) => {
              expect(response.status).to.eq(409);
              expect(response.body.message).to.include("requires overrideReason");
            });
          });
        });
      });
    });
  });

  it("deve permitir sobrescrita da restricao quando professor informa justificativa", () => {
    cy.fixture("prescription").then((fixture) => {
      cy.loginAs("teacher").then(({ token }) => {
        cy.createStudent(token).then((student) => {
          cy.findWorkoutType(token, "Corrida", "Treino intervalado/tiro").then((tiro) => {
            cy.findWorkoutType(token, "Fortalecimento", "Inferiores").then((inferiores) => {
              cy.api({
                method: "POST",
                url: "/prescriptions",
                headers: { Authorization: `Bearer ${token}` },
                body: {
                  studentId: student.userId,
                  scheduledDate: "2026-05-06",
                  overrideReason: fixture.overrideReason,
                  items: [
                    { workoutTypeId: tiro.id, loadLevel: "intensa", durationMinutes: 45 },
                    { workoutTypeId: inferiores.id, loadLevel: "intensa", durationMinutes: 50 }
                  ]
                }
              }).then((response) => {
                expect(response.status).to.eq(201);
                const restriction = response.body.warnings.find((warning) => warning.severity === "restriction");
                expect(restriction.overridden).to.eq(true);
                expect(restriction.overrideReason).to.eq(fixture.overrideReason);
              });
            });
          });
        });
      });
    });
  });

  it("aluno deve registrar dados de treino concluido", () => {
    cy.loginAs("teacher").then(({ token: teacherToken }) => {
      cy.createStudent(teacherToken).then((student) => {
        cy.findWorkoutType(teacherToken, "Corrida", "Rodagem leve").then((corrida) => {
          cy.api({
            method: "POST",
            url: "/prescriptions",
            headers: { Authorization: `Bearer ${teacherToken}` },
            body: {
              studentId: student.userId,
              scheduledDate: "2026-05-07",
              items: [{ workoutTypeId: corrida.id, loadLevel: "leve", durationMinutes: 35, distanceKm: 5 }]
            }
          }).then((prescriptionResponse) => {
            const itemId = prescriptionResponse.body.items[0].id;

            cy.api({
              method: "POST",
              url: "/auth/login",
              body: { email: student.user.email, password: student.plainPassword }
            }).then((loginResponse) => {
              cy.api({
                method: "POST",
                url: "/workout-logs",
                headers: { Authorization: `Bearer ${loginResponse.body.token}` },
                body: {
                  prescriptionItemId: itemId,
                  durationMinutes: 36,
                  distanceKm: 5,
                  pace: "7:12",
                  rpe: 5,
                  painLevel: 0,
                  fatigueLevel: 3,
                  difficultyLevel: 4,
                  notes: "Treino concluido sem dor."
                }
              }).then((logResponse) => {
                expect(logResponse.status).to.eq(201);
                expect(logResponse.body.distanceKm).to.eq(5);
                expect(logResponse.body.painLevel).to.eq(0);
              });
            });
          });
        });
      });
    });
  });
});
