const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Configuração para relatórios Mochawesome
      //   require('cypress-plugin-api/support');
    },
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    baseUrl: 'https://www.saucedemo.com',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 60000,
    blockHosts: ['*backtrace.io'],
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/json',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    },
    retries: {
      runMode: 1,
      openMode: 0
    },
    env: {
      apiBaseUrl: 'https://reqres.in/api',
      apiKey: process.env.REQRES_API_KEY || 'Chave_Segura',
      apiTimeout: 10000
    }
  }
});
