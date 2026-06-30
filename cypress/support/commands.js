// =============================================================
// Comandos customizados para testes de API
// =============================================================

/**
 * Comando para requisições à API Reqres com configuração centralizada
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE, PATCH)
 * @param {string} endpoint - Endpoint da API (ex: /users)
 * @param {object} body - Body da requisição (opcional)
 * @param {object} options - Opções adicionais (headers, failOnStatusCode, etc.)
 */
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, options = {}) => {
  const baseUrl = Cypress.env('apiBaseUrl');

  const requestOptions = {
    method,
    url: `${baseUrl}${endpoint}`,
    failOnStatusCode: false,
    timeout: Cypress.env('apiTimeout'),
    headers: {
      'x-api-key': Cypress.env('apiKey')
    },
    ...options
  };

  if (body) {
    requestOptions.body = body;
  }

  return cy.request(requestOptions);
});

/**
 * Validação de contrato (schema) de resposta
 * Verifica se o objeto possui todas as chaves esperadas com os tipos corretos
 */
Cypress.Commands.add('validateSchema', { prevSubject: true }, (response, schema) => {
  const data = response.body.data || response.body;

  // Se for array, valida o primeiro item
  const item = Array.isArray(data) ? data[0] : data;

  Object.entries(schema).forEach(([key, expectedType]) => {
    expect(item).to.have.property(key);
    expect(typeof item[key]).to.eq(expectedType, `Campo "${key}" deveria ser ${expectedType}`);
  });

  return cy.wrap(response);
});

// =============================================================
// Comandos customizados para testes de UI
// =============================================================

/**
 * Login reutilizável via UI
 */
Cypress.Commands.add('login', (username, password) => {
  cy.get('[data-test="username"]').clear().type(username);
  cy.get('[data-test="password"]').clear().type(password);
  cy.get('[data-test="login-button"]').click();
});

/**
 * Verifica se uma mensagem de erro está visível com o texto esperado
 */
Cypress.Commands.add('assertErrorMessage', (expectedMessage) => {
  cy.get('[data-test="error"]')
    .should('be.visible')
    .and('contain.text', expectedMessage);
});
