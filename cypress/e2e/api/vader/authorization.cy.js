describe("VADER - Authorization", () => {
  it("deve bloquear rota protegida sem token", () => {
    cy.api({ method: "GET", url: "/students" }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq("Missing bearer token");
    });
  });

  it("deve bloquear token invalido", () => {
    cy.api({
      method: "GET",
      url: "/students",
      headers: { Authorization: "Bearer token-invalido" }
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq("Invalid or expired token");
    });
  });

  it("aluno nao deve acessar listagem de alunos do professor", () => {
    cy.loginAs("student").then(({ token }) => {
      cy.api({
        method: "GET",
        url: "/students",
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  it("aluno nao deve criar prescricao", () => {
    cy.loginAs("student").then(({ token }) => {
      cy.api({
        method: "POST",
        url: "/prescriptions",
        headers: { Authorization: `Bearer ${token}` },
        body: { studentId: "qualquer", scheduledDate: "2026-05-04", items: [] }
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  it("professor nao deve registrar treino no lugar do aluno", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.api({
        method: "POST",
        url: "/workout-logs",
        headers: { Authorization: `Bearer ${token}` },
        body: { prescriptionItemId: "qualquer" }
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });
});
