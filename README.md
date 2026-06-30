# 🧪 Desafio Técnico QA Sênior — Automação + Performance

Projeto de automação de testes (API + UI) e testes de performance, desenvolvido como desafio técnico para a posição de QA Sênior.

---

## 📋 Sumário

- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Estratégia de Testes](#-estratégia-de-testes)
- [Decisões Técnicas](#-decisões-técnicas)
- [Testes de Performance](#-testes-de-performance)
- [Relatórios](#-relatórios)
- [CI/CD](#-cicd)
- [Uso de IA](#-uso-de-ia)
- [Possíveis Melhorias](#-possíveis-melhorias)

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Cypress** | 13.x | Automação de testes UI e API |
| **Mochawesome** | 7.x | Geração de relatórios HTML |
| **k6** | 1.6.1 | Testes de performance |
| **GitHub Actions** | — | Pipeline de CI/CD |
| **Node.js** | 20.x | Runtime |

---

## 📁 Estrutura do Projeto

```
qa-senior-challenge/
├── cypress/
│   ├── e2e/
│   │   ├── api/
│   │   │   └── reqres.api.cy.js          # Testes de API (Reqres.in)
│   │   └── ui/
│   │       ├── login.cy.js               # Testes de Login
│   │       └── ecommerce-flow.cy.js      # Fluxo completo de e-commerce
│   ├── fixtures/
│   │   ├── users.json                    # Dados de usuários (parametrizados)
│   │   ├── products.json                 # Dados de produtos e checkout
│   │   └── api-data.json                 # Dados para testes de API
│   ├── pages/                            # Page Objects (POM)
│   │   ├── LoginPage.js
│   │   ├── InventoryPage.js
│   │   ├── CartPage.js
│   │   └── CheckoutPage.js
│   └── support/
│       ├── commands.js                   # Comandos customizados
│       └── e2e.js                        # Configuração global
├── performance/
│   └── load-test.js                      # Testes de performance (k6)
├── .github/
│   └── workflows/
│       └── ci.yml                        # Pipeline GitHub Actions
├── cypress.config.js                     # Configuração do Cypress
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Node.js** 18+ instalado
- **k6** instalar (para testes de performance) — [Guia de instalação](https://k6.io/docs/getting-started/installation/)
-  Utilizado para instalação no ubuntu: k6 versionsudo snap install k6


### Instalação

```bash
# Clone o repositório
git clone https://github.com/MarioAlvesCarvalho/CYPRESS_NEXDOM.git
cd CYPRESS_NEXDOM

# Instale as dependências
npm install
```

### Executar Testes

```bash
# Todos os testes (API + UI) com relatório
npm test

# Apenas testes de API
npm run test:api

# Apenas testes de UI
npm run test:ui

# Abrir Cypress em modo interativo
npm run cy:open
```

### Executar Testes de Performance

```bash
# Teste completo com cenário de carga
npm run perf:test

# Smoke test (1 VU, 10 segundos)
npm run perf:test:smoke
```

---

## 🎯 Estratégia de Testes

### API (Reqres.in)

A estratégia de testes de API cobre:

1. **Validação de Status Code** — Verifica respostas de sucesso (200, 201) e erro (400, 404). A API Reqres não retorna 401, 403 ou 409 nativamente; essa limitação está documentada nos testes e foi tratada com cenários alternativos que cobrem o mesmo comportamento lógico.

2. **Validação de Contrato** — Verifica que a estrutura (schema) das respostas está correta, incluindo tipos de dados, campos obrigatórios e formatos (e-mail, URL). Utiliza um comando customizado `validateSchema` para reutilização.

3. **Fluxo CRUD Dinâmico** — Cria → Lê → Atualiza (PUT + PATCH) → Remove um recurso. Como a API não persiste dados, o fluxo valida que cada operação retorna a resposta esperada individualmente.

4. **Autenticação** — Cenários de login e registro com credenciais válidas e inválidas.

5. **Performance básica da API** — Valida tempo de resposta e comportamento com delay.

### UI (SauceDemo)

O fluxo escolhido foi o **e-commerce completo**: login → inventário → carrinho → checkout → confirmação. Esse fluxo foi selecionado por ser o mais representativo da aplicação e cobrir a maior superfície funcional.

1. **Login** — Cenários parametrizados (campos vazios, credenciais inválidas, usuário bloqueado) usando dados do fixture.

2. **Inventário** — Validação de listagem, ordenação por nome e preço (todas as 4 opções).

3. **Carrinho** — Adicionar/remover itens, validação de preços, navegação.

4. **Checkout** — Fluxo completo com validação de cálculo (subtotal + tax = total), validações de campos obrigatórios, cancelamento.

5. **Logout** — Encerramento da sessão.

### Prioridades

- **Qualidade sobre quantidade**: cada teste valida algo específico e relevante.
- **Estabilidade**: uso de `data-test` selectors, waits implícitos do Cypress, e retry automático.
- **Manutenibilidade**: POM, dados externalizados, comandos reutilizáveis.

---

## 💡 Decisões Técnicas

### Por que Cypress?

1. **Experiência consolidada** — É a ferramenta que tenho domínio mais profundo, o que garante um projeto com maior qualidade e boas práticas.
2. **Suporte nativo a API testing** — `cy.request()` permite testar APIs diretamente no mesmo framework, sem dependências extras.
3. **Seletores estáveis** — O SauceDemo usa `data-test` attributes, que combinam perfeitamente com a abordagem do Cypress.
4. **Relatórios integrados** — Mochawesome se integra nativamente e gera reports HTML ricos.
5. **Retry automático** — Reduz flakiness sem configuração adicional.

### Por que Reqres.in?

- Suporta operações CRUD (POST, GET, PUT, PATCH, DELETE)
- Possui endpoints de autenticação (login/register)
- Retorna status codes variados (200, 201, 204, 400, 404)
- Estável e disponível publicamente sem necessidade de API key

### Por que SauceDemo?

- Aplicação estável e projetada para automação
- Usa `data-test` attributes (seletores confiáveis)
- Fluxo e-commerce completo (login → checkout)
- Múltiplos cenários de erro embutidos (locked user, problem user)

### Page Object Model (POM)

Cada página tem seu próprio Page Object com:
- **Elementos**: getters com seletores encapsulados
- **Ações**: métodos que executam interações (click, type, select)
- **Validações**: assertions encapsuladas e reutilizáveis

Essa separação permite que mudanças na UI exijam alterações em um único arquivo.

### Dados Parametrizados

Todos os dados de teste estão em arquivos `fixture` (JSON):
- `users.json` — credenciais e cenários de login
- `products.json` — dados de produtos e checkout
- `api-data.json` — payloads, schemas e dados de API

Isso facilita manutenção e permite alterar cenários sem tocar nos testes.

---

## ⚡ Testes de Performance

### Ferramenta: k6

Escolhido por ser a ferramenta preferencial indicada no desafio e por oferecer:
- Scripting em JavaScript (consistência com o restante do projeto)
- Suporte nativo a thresholds e métricas customizadas
- Relatórios detalhados no terminal

### Cenário de Carga

```
Ramp-up:  0 → 10 VUs  (15s)
Estável:  10 VUs       (30s)
Pico:     10 → 20 VUs  (15s)
Pico:     20 VUs       (30s)
Ramp-down: 20 → 0 VUs  (10s)
```

### Thresholds Configurados

| Métrica | Threshold |
|---|---|
| Duração HTTP (p95) | < 2000ms |
| Taxa de falha HTTP | < 5% |
| Erros customizados | < 10% |
| Listagem de usuários (p95) | < 2500ms |
| Usuário individual (p95) | < 1500ms |
| Criação de usuário (p95) | < 2000ms |

### Endpoints Testados

- `GET /users?page={1,2}` — Listagem com paginação
- `GET /users/:id` — Consulta individual
- `POST /users` — Criação
- `PUT /users/:id` — Atualização
- `DELETE /users/:id` — Remoção

### Como Executar

```bash
# Teste completo
npm run perf:test

# Smoke test rápido
npm run perf:test:smoke
```

O resultado é salvo em `performance/results/summary.json`.

---

## 📊 Relatórios

### Mochawesome (Cypress)

Os relatórios são gerados automaticamente após a execução dos testes.

```bash
# Executar testes e gerar relatório
npm test

# Ou gerar relatório manualmente após execução
npm run report
```

**Localização:** `cypress/reports/html/report.html`

O relatório inclui:
- Resultado de cada teste (pass/fail/skip)
- Tempo de execução por spec e por teste
- Screenshots em caso de falha
- Agrupamento por describe/context

### k6 (Performance)

O k6 gera um sumário detalhado no terminal e salva o resultado completo em JSON.

**Localização:** `performance/results/summary.json`

---

## 🔄 CI/CD

### GitHub Actions

O pipeline está configurado em `.github/workflows/ci.yml` e é acionado em:
- Push para `main` ou `develop`
- Pull requests para `main`
- Execução manual (workflow_dispatch)

### Jobs

| Job | Descrição | Execução |
|---|---|---|
| `ui-tests` | Testes de UI com Cypress | Primeiro job |
| `performance-tests` | Testes de performance com k6 | Após UI tests |

### Por que os testes de API não estão na pipeline?

Os testes de API utilizam a Reqres.in, que no plano gratuito aplica rate limit agressivo (HTTP 429) para requisições originadas de IPs compartilhados de provedores de CI/CD como o GitHub Actions. Mesmo com estratégias de retry e delay entre requisições, o rate limit persiste no ambiente de CI.

Por esse motivo, os testes de API devem ser executados **localmente**, onde funcionam sem restrições. Essa é uma limitação conhecida de APIs públicas gratuitas em ambientes de integração contínua.

```bash
# Executar testes de API localmente
npm run test:api
```

Em um cenário real com APIs internas ou com planos pagos, os testes de API seriam integrados normalmente à pipeline.

### Artefatos

Os seguintes artefatos são salvos na pipeline:
- **Relatórios Mochawesome** — HTML interativo (30 dias)
- **Screenshots de falha** — Evidências visuais (15 dias)
- **Resultado k6** — JSON com métricas (30 dias)

---

## 🤖 Uso de IA

Este projeto utilizou IA (Claude, da Anthropic) como ferramenta de apoio em pontos específicos:

1. **Documentação** — Auxílio na estruturação e organização deste README.
2. **CI/CD** — Apoio na configuração do workflow do GitHub Actions, incluindo a instalação do k6 na pipeline e a publicação de artefatos.
3. **Revisão de código** — Validação de boas práticas em Cypress, consistência nos seletores e sugestões de melhoria nos assertions e na estrutura dos Page Objects.

**Prompts utilizados:**

> "Tenho um projeto de automação com Cypress (API + UI) e preciso configurar um pipeline no GitHub Actions. O pipeline precisa rodar os testes de API e UI em paralelo, e depois executar os testes de performance com k6. Como configuro a instalação do k6 no Ubuntu, a execução dos testes, e o upload dos relatórios Mochawesome e do resultado do k6 como artefatos? Preciso também que screenshots sejam salvos só quando houver falha."

> "Estou montando um teste de carga com k6 para a API Reqres.in. Quero cobrir os endpoints de CRUD (GET listagem, GET individual, POST, PUT e DELETE) com um cenário de ramp-up de 10 a 20 usuários virtuais. Preciso de thresholds no p95, métricas customizadas por endpoint, e um handleSummary que salve o resultado em JSON. Pode revisar meu script e sugerir melhorias?"

**Nota:** Toda a automação (testes de UI, API, Page Objects e fixtures) foi desenvolvida por mim com base na minha experiência de +10 anos em QA e automação com Cypress. A IA serviu como ferramenta de produtividade para tarefas complementares, não como autora do projeto.

---

## 🔮 Possíveis Melhorias

1. **Intercept de rede** — Usar `cy.intercept()` para mockar APIs e testar cenários de erro no UI (timeout, 500, etc.)
2. **Docker** — Containerizar a execução dos testes para consistência entre ambientes
3. **Allure Reports** — Migrar para Allure para relatórios mais ricos e com histórico de execuções
4. **Multi-browser** — Configurar execução em Chrome, Firefox e Edge na pipeline
5. **Monitoramento contínuo** — Integrar k6 Cloud para monitoramento de performance em tempo real
6. **BDD com Cucumber** — Para cenários mais legíveis por stakeholders não-técnicos
7. **Paralelismo no Cypress** — Usar Cypress Cloud ou `sorry-cypress` para execução distribuída

---

## 👤 Autor

**Mário Carvalho**
Head QA Automation

[E-mail](mario.alves.souza@gmail.com)

[LinkedIn](https://linkedin.com/in/marioascarvalho)

[Repositório do Projeto](https://github.com/MarioAlvesCarvalho/CYPRESS_NEXDOM.git)
