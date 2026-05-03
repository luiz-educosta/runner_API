describe("VADER - Responsiveness", () => {
  const maxResponseTimeMs = 1000;

  it("GET /health deve responder rapidamente", () => {
    cy.api({ method: "GET", url: "/health" }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.duration).to.be.lessThan(maxResponseTimeMs);
    });
  });

  it("POST /auth/login deve responder dentro do limite esperado", () => {
    cy.api({
      method: "POST",
      url: "/auth/login",
      body: { email: Cypress.env("professorEmail"), password: Cypress.env("professorPassword") }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.duration).to.be.lessThan(maxResponseTimeMs);
    });
  });

  it("GET /workout-types deve responder dentro do limite esperado", () => {
    cy.loginAs("teacher").then(({ token }) => {
      cy.api({
        method: "GET",
        url: "/workout-types",
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.duration).to.be.lessThan(maxResponseTimeMs);
      });
    });
  });

  it("GET /openapi.json deve responder e expor contrato da API", () => {
    cy.api({ method: "GET", url: "/openapi.json" }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.duration).to.be.lessThan(maxResponseTimeMs);
      expect(response.body.openapi).to.eq("3.0.3");
      expect(response.body.info.title).to.eq("runner_API");
    });
  });
});
