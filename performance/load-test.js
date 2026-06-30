import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');
const listUsersDuration = new Trend('list_users_duration', true);
const singleUserDuration = new Trend('single_user_duration', true);
const createUserDuration = new Trend('create_user_duration', true);

// Configuração de carga e thresholds
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Ramp-up: sobe para 5 VUs em 10s
    { duration: '20s', target: 5 },   // Carga estável: mantém 5 VUs por 20s
    { duration: '10s', target: 10 },  // Pico: sobe para 10 VUs em 10s
    { duration: '20s', target: 10 },  // Carga de pico: mantém 10 VUs por 20s
    { duration: '10s', target: 0 },   // Ramp-down: reduz para 0 em 10s
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],          // 95% das requisições < 3s
    http_req_failed: ['rate<0.05'],             // Menos de 5% de falhas
    errors: ['rate<0.1'],                       // Taxa de erros customizada < 10%
    list_users_duration: ['p(95)<3000'],        // Listagem de posts < 3s
    single_user_duration: ['p(95)<2000'],       // Post individual < 2s
    create_user_duration: ['p(95)<3000'],       // Criação de post < 3s
  },
};

/**
 * API utilizada: JSONPlaceholder (https://jsonplaceholder.typicode.com)
 *
 * Decisão técnica: A API Reqres.in aplica rate limit agressivo (HTTP 429)
 * para requisições originadas de IPs compartilhados de CI/CD.
 * O JSONPlaceholder é uma alternativa estável, sem rate limit,
 * ideal para testes de performance em ambientes de integração contínua.
 *
 * Os cenários de CRUD e as validações permanecem os mesmos.
 */
const BASE_URL = 'https://jsonplaceholder.typicode.com';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Cenário principal de teste
export default function () {
  // --- GET: Listagem de posts ---
  group('GET - Listar Posts', () => {
    const res = http.get(`${BASE_URL}/posts`, { headers });

    listUsersDuration.add(res.timings.duration);

    const success = check(res, {
      'GET /posts - status 200': (r) => r.status === 200,
      'GET /posts - possui dados': (r) => {
        const body = r.json();
        return Array.isArray(body) && body.length > 0;
      },
      'GET /posts - tempo de resposta < 3s': (r) => r.timings.duration < 3000,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- GET: Post individual ---
  group('GET - Post Individual', () => {
    const postId = Math.floor(Math.random() * 100) + 1;
    const res = http.get(`${BASE_URL}/posts/${postId}`, { headers });

    singleUserDuration.add(res.timings.duration);

    const success = check(res, {
      'GET /posts/:id - status 200': (r) => r.status === 200,
      'GET /posts/:id - possui id': (r) => {
        const body = r.json();
        return body.id === postId;
      },
      'GET /posts/:id - possui título': (r) => {
        const body = r.json();
        return body.title !== undefined;
      },
      'GET /posts/:id - tempo de resposta < 2s': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- POST: Criar post ---
  group('POST - Criar Post', () => {
    const payload = JSON.stringify({
      title: `Post_${Date.now()}`,
      body: 'Conteúdo de teste para validação de performance',
      userId: 1,
    });

    const res = http.post(`${BASE_URL}/posts`, payload, { headers });

    createUserDuration.add(res.timings.duration);

    const success = check(res, {
      'POST /posts - status 201': (r) => r.status === 201,
      'POST /posts - retorna id': (r) => {
        const body = r.json();
        return body.id !== undefined;
      },
      'POST /posts - tempo de resposta < 3s': (r) => r.timings.duration < 3000,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- PUT: Atualizar post ---
  group('PUT - Atualizar Post', () => {
    const payload = JSON.stringify({
      id: 1,
      title: 'Post Atualizado',
      body: 'Conteúdo atualizado via teste de performance',
      userId: 1,
    });

    const res = http.put(`${BASE_URL}/posts/1`, payload, { headers });

    const success = check(res, {
      'PUT /posts/:id - status 200': (r) => r.status === 200,
      'PUT /posts/:id - retorna dados atualizados': (r) => {
        const body = r.json();
        return body.title === 'Post Atualizado';
      },
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- DELETE: Remover post ---
  group('DELETE - Remover Post', () => {
    const res = http.del(`${BASE_URL}/posts/1`, null, { headers });

    const success = check(res, {
      'DELETE /posts/:id - status 200': (r) => r.status === 200,
    });

    errorRate.add(!success);
  });

  sleep(0.5);
}

// Sumário ao final do teste
export function handleSummary(data) {
  console.log('\n========================================');
  console.log('  RESUMO DO TESTE DE PERFORMANCE');
  console.log('========================================');
  console.log(`  Total de requisições: ${data.metrics.http_reqs.values.count}`);
  console.log(`  Taxa de falha: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`);
  console.log(`  Duração média: ${data.metrics.http_req_duration.values.avg.toFixed(0)}ms`);
  console.log(`  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(0)}ms`);
  console.log(`  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(0)}ms`);
  console.log('========================================\n');

  return {
    'performance/results/summary.json': JSON.stringify(data, null, 2),
  };
}