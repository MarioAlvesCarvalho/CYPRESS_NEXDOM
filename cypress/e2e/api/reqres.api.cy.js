/// <reference types="cypress" />

describe('API Tests - Reqres.in', () => {
  // Carrega dados parametrizados dos fixtures
  let apiData;

  before(() => {
    cy.fixture('api-data').then((data) => {
      apiData = data;
    });
  });

  // 1. Validação de Status Code
  context('Validação de Status Code', () => {
    it('GET /users - deve retornar status 200 para listagem de usuários', () => {
      cy.apiRequest('GET', '/users?page=2').then((response) => { //GETreqres.in/api/users?page=2
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.length).to.be.greaterThan(0);
      });
    });
    it('GET /users/:id - deve retornar status 200 para usuário existente', () => {
      cy.apiRequest('GET', '/users/2').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property('id', 2);
      });
    });
    it('GET /users/:id - deve retornar status 404 para usuário inexistente', () => {
      cy.apiRequest('GET', '/users/999').then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.be.empty;
      });
    });
    it('POST /register - deve retornar status 400 quando falta a senha', () => {
      cy.apiRequest('POST', '/register', apiData.registerFail).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });
    it('POST /login - deve retornar status 400 para login sem senha', () => {
      cy.apiRequest('POST', '/login', apiData.loginFail).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });

    /**
     * NOTA: A API Reqres não suporta nativamente os status 401, 403 e 409.
     */
    it('Simulação - deve validar comportamento esperado para status 401 (Unauthorized)', () => {
      // Reqres não possui endpoint autenticado, simulamos a expectativa
      cy.apiRequest('POST', '/login', apiData.loginFail).then((response) => {
        // API retorna 400, mas em um cenário real de auth inválida esperaríamos 401
        expect(response.status).to.be.oneOf([400, 401]);
        expect(response.body).to.have.property('error');
        cy.log('NOTA: Reqres retorna 400 para credenciais inválidas. Em API real, esperaríamos 401.');
      });
    });
    it('GET /users - deve validar paginação com página inexistente', () => {
      cy.apiRequest('GET', '/users?page=999').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an('array').and.to.have.length(0);
      });
    });
  });

  // 2. Validação de Contrato (Schema)
  context('Validação de Contrato', () => {
    it('GET /users/:id - deve validar schema do usuário', () => {
      cy.apiRequest('GET', '/users/2')
        .validateSchema(apiData.userSchema)
        .then((response) => {
          const user = response.body.data;
          // Validações adicionais de formato
          expect(user.email).to.match(/^[\w.-]+@[\w.-]+\.\w+$/);
          expect(user.avatar).to.match(/^https?:\/\/.+/);
        });
    });
    it('GET /users - deve validar schema da listagem com paginação', () => {
      cy.apiRequest('GET', '/users?page=1').then((response) => {
        const body = response.body;

        // Valida estrutura de paginação
        Object.entries(apiData.userListSchema).forEach(([key, type]) => {
          expect(body).to.have.property(key);
          expect(typeof body[key]).to.eq(type);
        });
        // Valida que 'data' é um array de usuários
        expect(body.data).to.be.an('array');
        // Valida cada item do array contra o schema de usuário
        body.data.forEach((user, index) => {
          Object.entries(apiData.userSchema).forEach(([key, type]) => {
            expect(user, `Usuário no índice ${index}`).to.have.property(key);
            expect(typeof user[key], `Campo "${key}" do índice ${index}`).to.eq(type);
          });
        });
      });
    });
    it('POST /register - deve validar contrato de registro bem-sucedido', () => {
      cy.apiRequest('POST', '/register', apiData.registerSuccess).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('token');
        expect(typeof response.body.id).to.eq('number');
        expect(typeof response.body.token).to.eq('string');
      });
    });
    it('POST /register - deve validar contrato de erro', () => {
      cy.apiRequest('POST', '/register', apiData.registerFail).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(typeof response.body.error).to.eq('string');
        expect(response.body.error).to.not.be.empty;
      });
    });
  });

  // 3. Fluxo com Dados Dinâmicos (CRUD)
  context('Fluxo CRUD com Dados Dinâmicos', () => {
    let createdUserId;

    it('POST /users - Criação de usuário', () => {
      cy.apiRequest('POST', '/users', apiData.newUser).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq(apiData.newUser.name);
        expect(response.body.job).to.eq(apiData.newUser.job);
        expect(response.body).to.have.property('createdAt');

        createdUserId = response.body.id;
        cy.log(`Usuário criado com ID: ${createdUserId}`);
      });
    });

    it('GET /users/:id - Validação do usuário (leitura)', () => {
      /**
       * NOTA: A API Reqres não persiste dados criados via POST.
       * O GET retorna dados pré-definidos. Em um cenário real, 
       * validaríamos os dados criados no passo anterior.
       * Aqui validamos que o endpoint GET funciona corretamente.
       */
      cy.apiRequest('GET', '/users/2').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('email');
        cy.log('NOTA: Reqres não persiste dados. Validando GET com dados pré-existentes.');
      });
    });

    it('PUT /users/:id - Alteração completa do usuário', () => {
      cy.apiRequest('PUT', '/users/2', apiData.updatedUser).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq(apiData.updatedUser.name);
        expect(response.body.job).to.eq(apiData.updatedUser.job);
        expect(response.body).to.have.property('updatedAt');
      });
    });

    it('PATCH /users/:id - Alteração parcial do usuário', () => {
      const partialUpdate = { job: 'Coordenador de QA' };
      cy.apiRequest('PATCH', '/users/2', partialUpdate).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.job).to.eq(partialUpdate.job);
        expect(response.body).to.have.property('updatedAt');
      });
    });

    it('DELETE /users/:id - Remoção do usuário', () => {
      cy.apiRequest('DELETE', '/users/2').then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });

  // 4. Testes de Autenticação
  context('Testes de Autenticação', () => {
    it('POST /login - deve realizar login com sucesso', () => {
      cy.apiRequest('POST', '/login', apiData.loginSuccess).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body.token).to.be.a('string').and.not.be.empty;
      });
    });
    it('POST /login - deve falhar sem senha', () => {
      cy.apiRequest('POST', '/login', apiData.loginFail).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq('Missing password');
      });
    });
    it('POST /login - deve falhar com body vazio', () => {
      cy.apiRequest('POST', '/login', {}).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });
  });

  // 5. Testes de Resposta e Performance básica
  context('Testes de Resposta da API', () => {
    it('GET /users - deve responder em tempo aceitável', () => {
      cy.apiRequest('GET', '/users?page=1').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.duration).to.be.lessThan(5000);
        cy.log(`Tempo de resposta: ${response.duration}ms`);
      });
    });
    it('GET /users?delay=1 - deve respeitar o delay configurado', () => {
      cy.apiRequest('GET', '/users?delay=1').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.duration).to.be.greaterThan(900);
        cy.log(`Tempo com delay: ${response.duration}ms`);
      });
    });
  });
});