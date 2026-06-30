class InventoryPage {
  //  Elementos 
  get pageTitle() {
    return cy.get('[data-test="title"]');
  }
  get inventoryItems() {
    return cy.get('[data-test="inventory-item"]');
  }
  get sortDropdown() {
    return cy.get('[data-test="product-sort-container"]');
  }
  get cartBadge() {
    return cy.get('[data-test="shopping-cart-badge"]');
  }
  get cartLink() {
    return cy.get('[data-test="shopping-cart-link"]');
  }
  get burgerMenuButton() {
    return cy.get('#react-burger-menu-btn');
  }
  get logoutLink() {
    return cy.get('#logout_sidebar_link');
  }

  //  Ações 
  addItemToCartByName(itemName) {
    cy.contains('[data-test="inventory-item"]', itemName)
      .find('button[data-test*="add-to-cart"]')
      .click();
    return this;
  }
  removeItemFromCartByName(itemName) {
    cy.contains('[data-test="inventory-item"]', itemName)
      .find('button[data-test*="remove"]')
      .click();
    return this;
  }
  sortBy(value) {
    this.sortDropdown.select(value);
    return this;
  }
  goToCart() {
    this.cartLink.click();
    return this;
  }
  openMenu() {
    this.burgerMenuButton.click();
    return this;
  }
  logout() {
    this.openMenu();
    this.logoutLink.should('be.visible').click();
    return this;
  }
  getItemPrice(itemName) {
    return cy.contains('[data-test="inventory-item"]', itemName)
      .find('[data-test="inventory-item-price"]')
      .invoke('text');
  }

  //  Validações 
  assertPageLoaded() {
    this.pageTitle.should('contain.text', 'Products');
    cy.url().should('include', '/inventory.html');
    return this;
  }
  assertCartCount(expectedCount) {
    if (expectedCount === 0) {
      cy.get('[data-test="shopping-cart-badge"]').should('not.exist');
    } else {
      this.cartBadge.should('have.text', String(expectedCount));
    }
    return this;
  }
  assertItemCount(expectedCount) {
    this.inventoryItems.should('have.length', expectedCount);
    return this;
  }
  assertSortedByPriceAsc() {
    const prices = [];
    cy.get('[data-test="inventory-item-price"]')
      .each(($el) => {
        prices.push(parseFloat($el.text().replace('$', '')));
      })
      .then(() => {
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sorted);
      });
    return this;
  }
  assertSortedByPriceDesc() {
    const prices = [];
    cy.get('[data-test="inventory-item-price"]')
      .each(($el) => {
        prices.push(parseFloat($el.text().replace('$', '')));
      })
      .then(() => {
        const sorted = [...prices].sort((a, b) => b - a);
        expect(prices).to.deep.equal(sorted);
      });
    return this;
  }
  assertSortedByNameAsc() {
    const names = [];
    cy.get('[data-test="inventory-item-name"]')
      .each(($el) => {
        names.push($el.text());
      })
      .then(() => {
        const sorted = [...names].sort();
        expect(names).to.deep.equal(sorted);
      });
    return this;
  }
  assertSortedByNameDesc() {
    const names = [];
    cy.get('[data-test="inventory-item-name"]')
      .each(($el) => {
        names.push($el.text());
      })
      .then(() => {
        const sorted = [...names].sort().reverse();
        expect(names).to.deep.equal(sorted);
      });
    return this;
  }
}

export default new InventoryPage();
