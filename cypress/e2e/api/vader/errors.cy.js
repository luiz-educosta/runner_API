describe("VADER - Errors", () => {
  it("deve retornar 401 para login invalido", () => {
    cy.api({
      method: "POST",
      url: "/auth/login",
      body: { email: Cypress.env("professorEmail"), password: "senha-errada" }
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq("Invalid credentials");
    });
  });

  it("deve retornar 400 para payload invalido no cadastro de aluno", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.api({
        method: "POST",
        url: "/students",
        headers: { Authorization: `Bearer ${token}` },
        body: { name: "A", email: "email-invalido", password: "123" }
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Validation error");
        expect(response.body.issues).to.be.an("array").and.not.be.empty;
      });
    });
  });

  it("deve retornar 404 para aluno inexistente do professor", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.api({
        method: "GET",
        url: "/students/aluno-inexistente",
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.message).to.eq("Student not found");
      });
    });
  });

  it("deve retornar 400 quando prescricao nao possui itens", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.createStudent(token).then((student) => {
        cy.api({
          method: "POST",
          url: "/prescriptions",
          headers: { Authorization: `Bearer ${token}` },
          body: { studentId: student.userId, scheduledDate: "2026-05-08", items: [] }
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq("Validation error");
        });
      });
    });
  });

  it("deve retornar 404 para rota inexistente", () => {
    cy.api({ method: "GET", url: "/rota-inexistente" }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body.message).to.include("Route GET /rota-inexistente not found");
    });
  });
});
