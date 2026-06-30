class LoginPage {
  //  Elementos 
  get usernameInput() {
    return cy.get('[data-test="username"]');
  }
  get passwordInput() {
    return cy.get('[data-test="password"]');
  }
  get loginButton() {
    return cy.get('[data-test="login-button"]');
  }
  get errorMessage() {
    return cy.get('[data-test="error"]');
  }
  get errorCloseButton() {
    return cy.get('.error-button');
  }

  //  Ações 
  visit() {
    cy.visit('/');
    cy.url().should('include', 'saucedemo.com');
    return this;
  }
  fillUsername(username) {
    if (username) {
      this.usernameInput.clear().type(username);
    }
    return this;
  }
  fillPassword(password) {
    if (password) {
      this.passwordInput.clear().type(password);

    }
    return this;
  }
  clickLogin() {
    this.loginButton.click();
    return this;
  }

  /**
   * Realiza login completo
   * @param {string} username
   * @param {string} password
   */
  doLogin(username, password) {
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLogin();
    return this;
  }

  //  Validações 
  assertErrorVisible(expectedMessage) {
    this.errorMessage
      .should('be.visible')
      .and('contain.text', expectedMessage);
    return this;
  }
  assertOnLoginPage() {
    this.loginButton.should('be.visible');
    cy.url().should('eq', 'https://www.saucedemo.com/');
    return this;
  }
  dismissError() {
    this.errorCloseButton.click();
    this.errorMessage.should('not.exist');

    return this;
  }
}

export default new LoginPage();
