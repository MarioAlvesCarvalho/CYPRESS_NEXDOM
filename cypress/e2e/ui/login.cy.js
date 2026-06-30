/// <reference types="cypress" />
import LoginPage from '../../pages/LoginPage';
import InventoryPage from '../../pages/InventoryPage';

describe('Login - SauceDemo', () => {
  let users;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    LoginPage.visit();
  });

  // Login com sucesso
  context('Login válido', () => {
    it('deve realizar login com usuário padrão e acessar a página de produtos', () => {
      LoginPage.doLogin(users.validUser.username, users.validUser.password);
      InventoryPage.assertPageLoaded();
      InventoryPage.assertItemCount(6);
    });
  });

  // Login com falha - testes parametrizados
  context('Login inválido - cenários parametrizados', () => {
    // Usa dados parametrizados do fixture para iterar sobre cenários de erro
    it('deve exibir erro para credenciais inválidas', function () {
      users.invalidCredentials.forEach((credentials) => {
        LoginPage.visit();

        // Preenche com os dados do cenário
        if (credentials.username) {
          LoginPage.fillUsername(credentials.username);
        }
        if (credentials.password) {
          LoginPage.fillPassword(credentials.password);
        }

        LoginPage.clickLogin();
        LoginPage.assertErrorVisible(credentials.expectedError);

        cy.log(`✅ Cenário validado: ${credentials.scenario}`);
      });
    });
  });

  // Usuário bloqueado
  context('Usuário bloqueado', () => {
    it('deve exibir mensagem de erro para usuário locked_out', () => {
      LoginPage.doLogin(users.lockedUser.username, users.lockedUser.password);
      LoginPage.assertErrorVisible('Epic sadface: Sorry, this user has been locked out.');
      LoginPage.assertOnLoginPage();
    });
  });

  // Validações visuais e de UI
  context('Validações de UI do Login', () => {
    it('deve exibir todos os elementos da página de login', () => {
      LoginPage.usernameInput.should('be.visible').and('have.attr', 'placeholder', 'Username');
      LoginPage.passwordInput.should('be.visible').and('have.attr', 'placeholder', 'Password');
      LoginPage.loginButton.should('be.visible').and('be.enabled');
    });

    it('deve permitir fechar a mensagem de erro', () => {
      LoginPage.clickLogin();
      LoginPage.assertErrorVisible('Username is required');
      LoginPage.dismissError();
    });
  });
});
