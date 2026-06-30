import './commands';

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
