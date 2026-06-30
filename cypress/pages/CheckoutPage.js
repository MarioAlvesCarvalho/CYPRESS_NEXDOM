class CheckoutPage {
  //  Elementos 
  get firstNameInput() {
    return cy.get('[data-test="firstName"]');
  }
  get lastNameInput() {
    return cy.get('[data-test="lastName"]');
  }
  get postalCodeInput() {
    return cy.get('[data-test="postalCode"]');
  }
  get continueButton() {
    return cy.get('[data-test="continue"]');
  }
  get cancelButton() {
    return cy.get('[data-test="cancel"]');
  }
  get finishButton() {
    return cy.get('[data-test="finish"]');
  }
  get backHomeButton() {
    return cy.get('[data-test="back-to-products"]');
  }
  get errorMessage() {
    return cy.get('[data-test="error"]');
  }
  get summarySubtotal() {
    return cy.get('[data-test="subtotal-label"]');
  }
  get summaryTax() {
    return cy.get('[data-test="tax-label"]');
  }
  get summaryTotal() {
    return cy.get('[data-test="total-label"]');
  }
  get completeHeader() {
    return cy.get('[data-test="complete-header"]');
  }
  get completeText() {
    return cy.get('[data-test="complete-text"]');
  }
  get pageTitle() {
    return cy.get('[data-test="title"]');
  }

  //  Ações 
  fillCheckoutInfo(firstName, lastName, postalCode) {
    if (firstName) this.firstNameInput.clear().type(firstName);
    if (lastName) this.lastNameInput.clear().type(lastName);
    if (postalCode) this.postalCodeInput.clear().type(postalCode);
    return this;
  }
  clickContinue() {
    this.continueButton.click();
    return this;
  }
  clickFinish() {
    this.finishButton.click();
    return this;
  }
  clickBackHome() {
    this.backHomeButton.click();
    return this;
  }
  clickCancel() {
    this.cancelButton.click();
    return this;
  }

  //  Validações 
  assertOnStepOne() {
    this.pageTitle.should('contain.text', 'Checkout: Your Information');
    cy.url().should('include', '/checkout-step-one.html');
    return this;
  }
  assertOnStepTwo() {
    this.pageTitle.should('contain.text', 'Checkout: Overview');
    cy.url().should('include', '/checkout-step-two.html');
    return this;
  }
  assertOrderComplete() {
    this.completeHeader.should('contain.text', 'Thank you for your order!');
    cy.url().should('include', '/checkout-complete.html');
    return this;
  }
  assertErrorVisible(expectedMessage) {
    this.errorMessage
      .should('be.visible')
      .and('contain.text', expectedMessage);
    return this;
  }
  assertTotalIsCorrect() {
    let subtotal, tax;

    this.summarySubtotal
      .invoke('text')
      .then((text) => {
        subtotal = parseFloat(text.replace('Item total: $', ''));
      });

    this.summaryTax
      .invoke('text')
      .then((text) => {
        tax = parseFloat(text.replace('Tax: $', ''));
      });

    this.summaryTotal
      .invoke('text')
      .then((text) => {
        const total = parseFloat(text.replace('Total: $', ''));
        expect(total).to.eq(
          parseFloat((subtotal + tax).toFixed(2)),
          'Total deve ser igual a subtotal + tax'
        );
      });

    return this;
  }
}

export default new CheckoutPage();
