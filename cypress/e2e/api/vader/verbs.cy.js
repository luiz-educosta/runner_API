describe("VADER - Verbs", () => {
  it("GET /health deve responder que a API esta online", () => {
    cy.api({ method: "GET", url: "/health" }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.deep.eq({ status: "ok" });
    });
  });

  it("POST /auth/login deve autenticar professor com credenciais validas", () => {
    cy.api({
      method: "POST",
      url: "/auth/login",
      body: {
        email: Cypress.env("professorEmail"),
        password: Cypress.env("professorPassword")
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.token).to.be.a("string");
      expect(response.body.user).to.include({ email: Cypress.env("professorEmail"), role: "teacher" });
    });
  });

  it("GET /workout-groups deve listar grupos de treino autenticado", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.api({
        method: "GET",
        url: "/workout-groups",
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.map((group) => group.name)).to.include.members([
          "Corrida",
          "Fortalecimento",
          "Mobilidade",
          "Ativacao muscular",
          "Educativos de corrida"
        ]);
      });
    });
  });

  it("POST /students deve criar aluno vinculado ao professor", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.createStudent(token).then((student) => {
        expect(student.user.role).to.eq("student");
        expect(student.teacherId).to.be.a("string");
      });
    });
  });

  it("PATCH /students/{studentId} deve atualizar dados esportivos do aluno", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.createStudent(token).then((student) => {
        cy.api({
          method: "PATCH",
          url: `/students/${student.userId}`,
          headers: { Authorization: `Bearer ${token}` },
          body: { level: "intermediario", goal: "Completar 10 km" }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.level).to.eq("intermediario");
          expect(response.body.goal).to.eq("Completar 10 km");
        });
      });
    });
  });
});
