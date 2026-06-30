import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ================================================================
// Métricas customizadas
// ================================================================
const errorRate = new Rate('errors');
const listUsersDuration = new Trend('list_users_duration', true);
const singleUserDuration = new Trend('single_user_duration', true);
const createUserDuration = new Trend('create_user_duration', true);

// ================================================================
// Configuração de carga e thresholds
// ================================================================
export const options = {
 stages: [
    { duration: '10s', target: 5 },   // Ramp-up: sobe para 5 VUs
    { duration: '20s', target: 5 },   // Carga estável
    { duration: '10s', target: 10 },  // Pico: sobe para 10 VUs
    { duration: '20s', target: 10 },  // Carga de pico
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.15'],
    errors: ['rate<0.2'],
    list_users_duration: ['p(95)<3000'],
    single_user_duration: ['p(95)<2500'],
    create_user_duration: ['p(95)<3000'],
  },
};

const BASE_URL = 'https://reqres.in/api';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-api-key': __ENV.REQRES_API_KEY,
};

// ================================================================
// Cenário principal de teste
// ================================================================
export default function () {
  // --- GET: Listagem de usuários ---
  group('GET - Listar Usuários', () => {
    const page = Math.floor(Math.random() * 2) + 1;
    const res = http.get(`${BASE_URL}/users?page=${page}`, { headers });

    listUsersDuration.add(res.timings.duration);

    const body = res.json();

    const success = check(res, {
      'GET /users - status 200': (r) => r.status === 200,
      'GET /users - possui dados': () => body.data && body.data.length > 0,
      'GET /users - possui paginação': () => body.page !== undefined && body.total !== undefined,
      'GET /users - tempo de resposta < 2s': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- GET: Usuário individual ---
  group('GET - Usuário Individual', () => {
    const userId = Math.floor(Math.random() * 12) + 1;
    const res = http.get(`${BASE_URL}/users/${userId}`, { headers });

    singleUserDuration.add(res.timings.duration);

    const body = res.json();

    const success = check(res, {
      'GET /users/:id - status 200': (r) => r.status === 200,
      'GET /users/:id - possui id correto': () => body.data && body.data.id === userId,
      'GET /users/:id - possui email': () => body.data && body.data.email !== undefined,
      'GET /users/:id - tempo de resposta < 1.5s': (r) => r.timings.duration < 1500,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- POST: Criar usuário ---
  group('POST - Criar Usuário', () => {
    const payload = JSON.stringify({
      name: `User_${Date.now()}`,
      job: 'QA Engineer',
    });

    const res = http.post(`${BASE_URL}/users`, payload, { headers });

    createUserDuration.add(res.timings.duration);

    const success = check(res, {
      'POST /users - status 201': (r) => r.status === 201,
      'POST /users - retorna id': (r) => JSON.parse(r.body).id !== undefined,
      'POST /users - retorna createdAt': (r) => JSON.parse(r.body).createdAt !== undefined,
      'POST /users - tempo de resposta < 2s': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- PUT: Atualizar usuário ---
  group('PUT - Atualizar Usuário', () => {
    const payload = JSON.stringify({
      name: 'Updated User',
      job: 'Head QA',
    });

    const res = http.put(`${BASE_URL}/users/2`, payload, { headers });

    const success = check(res, {
      'PUT /users/:id - status 200': (r) => r.status === 200,
      'PUT /users/:id - retorna updatedAt': (r) => JSON.parse(r.body).updatedAt !== undefined,
    });

    errorRate.add(!success);
  });

  sleep(1);

  // --- DELETE: Remover usuário ---
  group('DELETE - Remover Usuário', () => {
    const res = http.del(`${BASE_URL}/users/2`, null, { headers });

    const success = check(res, {
      'DELETE /users/:id - status 204': (r) => r.status === 204,
    });

    errorRate.add(!success);
  });

  sleep(0.5);
}

// ================================================================
// Sumário ao final do teste
// ================================================================
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
