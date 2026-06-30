import './commands';
beforeEach(() => {
  cy.intercept('**/backtrace.io/**', { statusCode: 200, body: {} });
  cy.intercept('**/sentry.io/**', { statusCode: 200, body: {} });
});
// Oculta exceções de fetch/XHR que não são relevantes para os testes
Cypress.on('uncaught:exception', (err) => {
  // Ignora erros comuns de aplicações SPA que não afetam os testes
  if (
    err.message.includes('ResizeObserver loop') ||
    err.message.includes('Non-Error promise rejection')
  ) {
    return false;
  }
});
