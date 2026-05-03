Cypress.Commands.add("api", (options) => {
  return cy.request({
    failOnStatusCode: false,
    ...options
  });
});

Cypress.Commands.add("loginAs", (profile) => {
  const credentials = profile === "student"
    ? { email: Cypress.env("alunoEmail"), password: Cypress.env("alunoPassword") }
    : { email: Cypress.env("professorEmail"), password: Cypress.env("professorPassword") };

  return cy.api({
    method: "POST",
    url: "/auth/login",
    body: credentials
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.token).to.be.a("string");
    return cy.wrap({ token: response.body.token, user: response.body.user });
  });
});

Cypress.Commands.add("authHeader", (token) => {
  return cy.wrap({ Authorization: `Bearer ${token}` });
});

Cypress.Commands.add("getWorkoutTypes", (token) => {
  return cy.api({
    method: "GET",
    url: "/workout-types",
    headers: { Authorization: `Bearer ${token}` }
  }).then((response) => {
    expect(response.status).to.eq(200);
    return cy.wrap(response.body);
  });
});

Cypress.Commands.add("findWorkoutType", (token, groupName, workoutName) => {
  return cy.getWorkoutTypes(token).then((types) => {
    const workoutType = types.find((type) => type.group.name === groupName && type.name === workoutName);
    expect(workoutType, `${groupName} - ${workoutName}`).to.exist;
    return cy.wrap(workoutType);
  });
});

Cypress.Commands.add("createStudent", (teacherToken, overrides = {}) => {
  const unique = Date.now();
  const student = {
    name: `Aluno Cypress ${unique}`,
    email: `aluno.cypress.${unique}@example.com`,
    password: "123456",
    level: "iniciante",
    goal: "Correr 5 km",
    ...overrides
  };

  return cy.api({
    method: "POST",
    url: "/students",
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: student
  }).then((response) => {
    expect(response.status).to.eq(201);
    return cy.wrap({ ...response.body, plainPassword: student.password });
  });
});
