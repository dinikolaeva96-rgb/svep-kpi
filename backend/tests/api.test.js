'use strict';
/**
 * Интеграционные тесты REST API.
 * Требует запущенного бэкенда на PORT (по умолчанию 3001).
 * Запуск: node tests/api.test.js
 */

const fetch = require('node-fetch');

const BASE = `http://localhost:${process.env.PORT || 3001}/api`;
let accessToken = '';
let passed = 0;
let failed = 0;

// ── helpers ─────────────────────────────────────────────────────────────────
function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function get(path, auth = false) {
  const headers = auth ? { Authorization: `Bearer ${accessToken}` } : {};
  const r = await fetch(`${BASE}${path}`, { headers });
  return { status: r.status, body: await r.json() };
}

async function post(path, data, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${accessToken}`;
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(data) });
  return { status: r.status, body: await r.json() };
}

async function patch(path, data, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${accessToken}`;
  const r = await fetch(`${BASE}${path}`, { method: 'PATCH', headers, body: JSON.stringify(data) });
  return { status: r.status, body: await r.json() };
}

// ── тесты ────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n🔬  СВЭП API — интеграционные тесты\n');
  console.log('── Health ──────────────────────────────────────');
  {
    const { status, body } = await get('/health');
    ok('GET /health → 200',   status === 200);
    ok('health.ok === true',  body.ok === true);
    ok('health.ts присутствует', typeof body.ts === 'string');
  }

  console.log('\n── Авторизация ─────────────────────────────────');
  {
    const { status, body } = await post('/auth/login', { email: 'admin@svep.ru', password: 'Admin123!' });
    ok('POST /auth/login → 200',           status === 200);
    ok('Получен accessToken',               typeof body.accessToken === 'string');
    ok('Получен refreshToken',              typeof body.refreshToken === 'string');
    ok('role === admin',                    body.role === 'admin');
    if (body.accessToken) accessToken = body.accessToken;

    const bad = await post('/auth/login', { email: 'admin@svep.ru', password: 'wrong' });
    ok('Неверный пароль → 401',            bad.status === 401);
  }

  console.log('\n── Отделы ──────────────────────────────────────');
  {
    const { status, body } = await get('/departments');
    ok('GET /departments → 200',           status === 200);
    ok('Ровно 16 отделов',                 Array.isArray(body) && body.length === 16);
    ok('Первый отдел — ОВЛ',              body[0]?.name_short === 'ОВЛ');
    ok('Поле indicator_count есть',        body[0]?.indicator_count >= 0);

    const one = await get('/departments/1');
    ok('GET /departments/1 → 200',         one.status === 200);
    ok('indicators[] присутствует',         Array.isArray(one.body.indicators));
    ok('6 индикаторов у отдела 1',         one.body.indicators.length === 6);

    const miss = await get('/departments/999');
    ok('GET /departments/999 → 404',       miss.status === 404);
  }

  console.log('\n── KPI ─────────────────────────────────────────');
  {
    const { status, body } = await get('/kpi/1?year=2026&month=5');
    ok('GET /kpi/1 → 200',                 status === 200);
    ok('6 индикаторов в ответе',           body.indicators?.length === 6);
    ok('status поле есть',                 ['green','yellow','red','no_data'].includes(body.indicators?.[0]?.status));

    const hist = await get('/kpi/1/1');
    ok('GET /kpi/1/1 история → 200',       hist.status === 200);
    ok('history[] присутствует',            Array.isArray(hist.body.history));
    ok('Более 10 точек истории',           hist.body.history.length > 10);

    // Ввод KPI (требует авторизации)
    const headers = { 'Content-Type': 'application/json' };
    const r = await fetch(`${BASE}/kpi/999/999`, { method: 'PUT', headers, body: JSON.stringify({ year: 2026, month: 5, actual: 90 }) });
    const upd = { status: r.status, body: await r.json() };
    ok('PUT без токена → 401',             upd.status === 401);
  }

  console.log('\n── Мастер-карта ────────────────────────────────');
  {
    const { status, body } = await get('/master?year=2026&month=5');
    ok('GET /master → 200',                status === 200);
    ok('16 отделов в матрице',             body.departments?.length === 16);
    ok('6 доменов',                        body.domains?.length === 6);
    ok('overall_score числовой',           typeof body.departments?.[0]?.overall_score === 'number');
    ok('Ячейки доменов есть',             typeof body.departments?.[0]?.domains === 'object');
  }

  console.log('\n── Алерты ──────────────────────────────────────');
  {
    const { status, body } = await get('/alerts?year=2026&month=5');
    ok('GET /alerts → 200',                status === 200);
    ok('summary присутствует',             typeof body.summary === 'object');
    ok('alerts[] присутствует',            Array.isArray(body.alerts));
    ok('summary.total > 0',               body.summary?.total > 0);
    if (body.alerts.length > 0) {
      ok('trend поле есть',               ['up','down','stable'].includes(body.alerts[0]?.trend));
    }
  }

  console.log('\n── Тренды ──────────────────────────────────────');
  {
    const dept = await get('/trends/1?months=6');
    ok('GET /trends/1 → 200',              dept.status === 200);
    ok('points[] присутствует',            Array.isArray(dept.body.points));
    ok('Не более 6 точек',                 dept.body.points.length <= 6);

    const comp = await get('/trends/company/summary?months=12');
    ok('GET /trends/company/summary → 200',comp.status === 200);
    ok('Company points[] есть',            Array.isArray(comp.body.points));
  }

  console.log('\n── Кайдзен ─────────────────────────────────────');
  {
    const list = await get('/kaizen');
    ok('GET /kaizen → 200',               list.status === 200);
    ok('Массив кайдзен',                  Array.isArray(list.body));

    const created = await post('/kaizen', { dept_id: 1, title: 'Тест из тестов', author_name: 'CI' });
    ok('POST /kaizen → 201',              created.status === 201);
    ok('Возвращён id',                    typeof created.body.id === 'number');
  }

  console.log('\n── Пользователи (admin) ────────────────────────');
  {
    const users = await get('/users', true);
    ok('GET /users с токеном → 200',      users.status === 200);
    ok('Массив пользователей',            Array.isArray(users.body));
    ok('Минимум 4 пользователя',          users.body.length >= 4);

    const noAuth = await get('/users', false);
    ok('GET /users без токена → 401',     noAuth.status === 401);

    // Создание и удаление тестового пользователя
    const email = `test_${Date.now()}@svep.ru`;
    const created = await post('/users', {
      email, password: 'Test1234!', name: 'Тестовый CI', role: 'public',
    }, true);
    ok('POST /users → 201',              created.status === 201);

    if (created.body.id) {
      const del = await fetch(`${BASE}/users/${created.body.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` },
      });
      ok('DELETE /users/:id → 200',      del.status === 200);
    }
  }

  console.log('\n── Индикаторы ──────────────────────────────────');
  {
    const list = await get('/indicators?dept_id=1', true);
    ok('GET /indicators → 200',          list.status === 200);
    ok('Возвращает массив',              Array.isArray(list.body));
    ok('6 индикаторов отдела 1',        list.body.length === 6);

    const upd = await patch('/indicators/1', { target: 97, warning_thr: 88 }, true);
    ok('PATCH /indicators/1 → 200',     upd.status === 200);
    ok('ok: true',                       upd.body.ok === true);
    ok('Новый target в ответе',          upd.body.indicator?.target === 97);
  }

  console.log('\n── Аудит ───────────────────────────────────────');
  {
    const { status, body } = await get('/audit', true);
    ok('GET /audit → 200',               status === 200);
    ok('total > 0 (есть записи)',        body.total > 0);
    ok('rows[] присутствует',            Array.isArray(body.rows));
    ok('Первая запись имеет action',     typeof body.rows?.[0]?.action === 'string');
  }

  console.log('\n── Swagger Docs ────────────────────────────────');
  {
    const r = await fetch(`${BASE}/docs/`);
    ok('GET /api/docs/ → 200 (Swagger)', r.status === 200);
  }

  // ── Итог ──
  console.log(`\n${'─'.repeat(50)}`);
  const total = passed + failed;
  const pct   = Math.round(passed / total * 100);
  console.log(`\n📊  Результат: ${passed}/${total} тестов прошли (${pct}%)\n`);
  if (failed > 0) {
    console.error(`❌  ${failed} тест(ов) провалены\n`);
    process.exit(1);
  } else {
    console.log('✅  Все тесты прошли!\n');
  }
}

run().catch(err => { console.error('Фатальная ошибка:', err); process.exit(1); });
