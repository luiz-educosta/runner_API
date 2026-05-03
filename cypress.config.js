const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_API_URL || "http://localhost:3333",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      professorEmail: process.env.CYPRESS_PROFESSOR_EMAIL || "professor@example.com",
      professorPassword: process.env.CYPRESS_PROFESSOR_PASSWORD || "123456",
      alunoEmail: process.env.CYPRESS_ALUNO_EMAIL || "aluno@example.com",
      alunoPassword: process.env.CYPRESS_ALUNO_PASSWORD || "123456"
    }
  }
});
