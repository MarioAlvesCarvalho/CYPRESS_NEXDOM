/// <reference types="cypress" />
import LoginPage from '../../pages/LoginPage';
import InventoryPage from '../../pages/InventoryPage';
import CartPage from '../../pages/CartPage';
import CheckoutPage from '../../pages/CheckoutPage';

describe('Fluxo E-commerce - SauceDemo', () => {
  let users, products;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
    cy.fixture('products').then((data) => {
      products = data;
    });
  });

  beforeEach(() => {
    LoginPage.visit();
    LoginPage.doLogin(users.validUser.username, users.validUser.password);
    InventoryPage.assertPageLoaded();
  });

  // Inventário e Ordenação
  context('Inventário de Produtos', () => {
    it('deve exibir 6 produtos na listagem', () => {
      InventoryPage.assertItemCount(6);
    });

    it('deve ordenar produtos por preço - menor para maior', () => {
      InventoryPage.sortBy('lohi');
      InventoryPage.assertSortedByPriceAsc();
    });

    it('deve ordenar produtos por preço - maior para menor', () => {
      InventoryPage.sortBy('hilo');
      InventoryPage.assertSortedByPriceDesc();
    });

    it('deve ordenar produtos por nome A-Z', () => {
      InventoryPage.sortBy('az');
      InventoryPage.assertSortedByNameAsc();
    });

    it('deve ordenar produtos por nome Z-A', () => {
      InventoryPage.sortBy('za');
      InventoryPage.assertSortedByNameDesc();
    });
  });

  // Carrinho de Compras
  context('Carrinho de Compras', () => {
    it('deve adicionar um produto ao carrinho e validar o badge', () => {
      InventoryPage.addItemToCartByName(products.expectedProducts.backpack.name);
      InventoryPage.assertCartCount(1);
    });

    it('deve adicionar múltiplos produtos ao carrinho', () => {
      InventoryPage
        .addItemToCartByName(products.expectedProducts.backpack.name)
        .addItemToCartByName(products.expectedProducts.bikeLight.name);
      InventoryPage.assertCartCount(2);
    });

    it('deve remover produto do carrinho pela página de inventário', () => {
      InventoryPage.addItemToCartByName(products.expectedProducts.backpack.name);
      InventoryPage.assertCartCount(1);
      InventoryPage.removeItemFromCartByName(products.expectedProducts.backpack.name);
      InventoryPage.assertCartCount(0);
    });

    it('deve exibir os produtos corretos na página do carrinho', () => {
      InventoryPage
        .addItemToCartByName(products.expectedProducts.backpack.name)
        .addItemToCartByName(products.expectedProducts.bikeLight.name);
      InventoryPage.goToCart();

      CartPage.assertPageLoaded();
      CartPage.assertCartItemCount(2);
      CartPage.assertItemInCart(products.expectedProducts.backpack.name);
      CartPage.assertItemInCart(products.expectedProducts.bikeLight.name);
    });

    it('deve remover produto pela página do carrinho', () => {
      InventoryPage.addItemToCartByName(products.expectedProducts.backpack.name);
      InventoryPage.goToCart();

      CartPage.assertPageLoaded();
      CartPage.removeItemByName(products.expectedProducts.backpack.name);
      CartPage.assertItemNotInCart(products.expectedProducts.backpack.name);
    });

    it('deve validar preço do produto no carrinho', () => {
      InventoryPage.addItemToCartByName(products.expectedProducts.backpack.name);
      InventoryPage.goToCart();

      CartPage.assertItemPrice(
        products.expectedProducts.backpack.name,
        products.expectedProducts.backpack.price
      );
    });

    it('deve retornar ao inventário pelo botão Continue Shopping', () => {
      InventoryPage.addItemToCartByName(products.expectedProducts.backpack.name);
      InventoryPage.goToCart();
      CartPage.continueShopping();
      InventoryPage.assertPageLoaded();
    });
  });

  // Fluxo Completo de Checkout
  context('Checkout - Fluxo Completo', () => {
    beforeEach(() => {
      // Adiciona produto antes de cada teste de checkout
      InventoryPage.addItemToCartByName(products.expectedProducts.backpack.name);
      InventoryPage.goToCart();
      CartPage.proceedToCheckout();
      CheckoutPage.assertOnStepOne();
    });

    it('deve completar compra com sucesso (fluxo E2E completo)', () => {
      CheckoutPage.fillCheckoutInfo(
        products.checkoutInfo.firstName,
        products.checkoutInfo.lastName,
        products.checkoutInfo.postalCode
      );
      CheckoutPage.clickContinue();
      CheckoutPage.assertOnStepTwo();
      CheckoutPage.assertTotalIsCorrect();
      CheckoutPage.clickFinish();
      CheckoutPage.assertOrderComplete();
    });

    it('deve retornar para produtos após finalizar compra', () => {
      CheckoutPage.fillCheckoutInfo(
        products.checkoutInfo.firstName,
        products.checkoutInfo.lastName,
        products.checkoutInfo.postalCode
      );
      CheckoutPage.clickContinue();
      CheckoutPage.clickFinish();
      CheckoutPage.assertOrderComplete();
      CheckoutPage.clickBackHome();
      InventoryPage.assertPageLoaded();
    });
  });

  // Checkout - Validações de Erro
  context('Checkout - Validações Negativas', () => {
    beforeEach(() => {
      InventoryPage.addItemToCartByName(products.expectedProducts.backpack.name);
      InventoryPage.goToCart();
      CartPage.proceedToCheckout();
    });

    it('deve exibir erro ao prosseguir sem preencher dados', () => {
      CheckoutPage.clickContinue();
      CheckoutPage.assertErrorVisible('Error: First Name is required');
    });

    it('deve exibir erro sem sobrenome', () => {
      CheckoutPage.fillCheckoutInfo(products.checkoutInfo.firstName, null, null);
      CheckoutPage.clickContinue();
      CheckoutPage.assertErrorVisible('Error: Last Name is required');
    });

    it('deve exibir erro sem CEP', () => {
      CheckoutPage.fillCheckoutInfo(
        products.checkoutInfo.firstName,
        products.checkoutInfo.lastName,
        null
      );
      CheckoutPage.clickContinue();
      CheckoutPage.assertErrorVisible('Error: Postal Code is required');
    });

    it('deve cancelar checkout e voltar ao carrinho', () => {
      CheckoutPage.clickCancel();
      CartPage.assertPageLoaded();
    });
  });

  // Logout
  context('Logout', () => {
    it('deve realizar logout com sucesso', () => {
      InventoryPage.logout();
      LoginPage.assertOnLoginPage();
    });
  });
});
