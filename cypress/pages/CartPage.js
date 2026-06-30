class CartPage {
  //  Elementos 

  get pageTitle() {
    return cy.get('[data-test="title"]');
  }

  get cartItems() {
    return cy.get('[data-test="inventory-item"]');
  }

  get checkoutButton() {
    return cy.get('[data-test="checkout"]');
  }

  get continueShoppingButton() {
    return cy.get('[data-test="continue-shopping"]');
  }

  //  Ações 

  removeItemByName(itemName) {
    cy.contains('[data-test="inventory-item"]', itemName)
      .find('button[data-test*="remove"]')
      .click();
    return this;
  }

  proceedToCheckout() {
    this.checkoutButton.click();
    return this;
  }

  continueShopping() {
    this.continueShoppingButton.click();
    return this;
  }

  //  Validações 

  assertPageLoaded() {
    this.pageTitle.should('contain.text', 'Your Cart');
    cy.url().should('include', '/cart.html');
    return this;
  }

  assertItemInCart(itemName) {
    cy.contains('[data-test="inventory-item"]', itemName).should('be.visible');
    return this;
  }

  assertItemNotInCart(itemName) {
    cy.contains('[data-test="inventory-item"]', itemName).should('not.exist');
    return this;
  }

  assertCartItemCount(expectedCount) {
    if (expectedCount === 0) {
      this.cartItems.should('not.exist');
    } else {
      this.cartItems.should('have.length', expectedCount);
    }
    return this;
  }

  assertItemPrice(itemName, expectedPrice) {
    cy.contains('[data-test="inventory-item"]', itemName)
      .find('[data-test="inventory-item-price"]')
      .should('have.text', expectedPrice);
    return this;
  }
}

export default new CartPage();
