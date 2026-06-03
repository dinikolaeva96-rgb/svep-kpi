'use strict';

/** @type {import('openapi3-ts').OpenAPIObject} */
const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Экосистема СВЭП — API',
    version: '1.0.0',
    description: `REST API корпоративного KPI-портала ООО «Средневолжскэлектропроект».

**Авторизация:** Bearer JWT. Получить токен через \`POST /api/auth/login\`.

**Роли (уровни доступа):**
- \`public\` — только чтение публичных данных
- \`dept_head\` — ввод KPI своего отдела, кайдзен
- \`management\` — просмотр всего, аудит
- \`admin\` — полный доступ, управление пользователями`,
    contact: { name: 'ООО СВЭП', email: 'admin@svep.ru' },
  },
  servers: [{ url: '/api', description: 'Текущий сервер' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Department: {
        type: 'object',
        properties: {
          id:             { type: 'integer' },
          code:           { type: 'string', example: 'OVL' },
          name_short:     { type: 'string', example: 'ОВЛ' },
          name_full:      { type: 'string', example: 'Отдел воздушных линий' },
          staff_count:    { type: 'integer', example: 12 },
          indicator_count:{ type: 'integer' },
        },
      },
      Indicator: {
        type: 'object',
        properties: {
          id:           { type: 'integer' },
          dept_id:      { type: 'integer' },
          domain_code:  { type: 'string', example: 'quality' },
          domain_name:  { type: 'string', example: 'Качество' },
          domain_color: { type: 'string', example: '#3B82F6' },
          name:         { type: 'string', example: 'Индекс качества' },
          unit:         { type: 'string', example: '%' },
          target:       { type: 'number', example: 95 },
          warning_thr:  { type: 'number', example: 85 },
          critical_thr: { type: 'number', example: 75 },
          weight:       { type: 'number', example: 1.5 },
          actual:       { type: 'number', nullable: true },
          plan:         { type: 'number', nullable: true },
          status:       { type: 'string', enum: ['green', 'yellow', 'red', 'no_data'] },
        },
      },
      KpiValue: {
        type: 'object',
        properties: {
          indicator_id:  { type: 'integer' },
          period_year:   { type: 'integer' },
          period_month:  { type: 'integer', minimum: 1, maximum: 12 },
          actual:        { type: 'number', nullable: true },
          plan:          { type: 'number', nullable: true },
          comment:       { type: 'string', nullable: true },
        },
      },
      MasterResponse: {
        type: 'object',
        properties: {
          year:         { type: 'integer' },
          month:        { type: 'integer' },
          domains:      { type: 'array', items: { $ref: '#/components/schemas/Domain' } },
          departments:  { type: 'array', items: { $ref: '#/components/schemas/MasterDept' } },
        },
      },
      Domain: {
        type: 'object',
        properties: {
          id:       { type: 'integer' },
          code:     { type: 'string', example: 'quality' },
          name_ru:  { type: 'string', example: 'Качество' },
          color:    { type: 'string', example: '#3B82F6' },
          icon:     { type: 'string', example: '🏆' },
        },
      },
      MasterDept: {
        allOf: [{ $ref: '#/components/schemas/Department' }],
        properties: {
          overall_score: { type: 'number', nullable: true },
          domains: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                score:   { type: 'number', nullable: true },
                avg_pct: { type: 'number', nullable: true },
              },
            },
          },
        },
      },
      AlertItem: {
        type: 'object',
        properties: {
          indicator_id: { type: 'integer' },
          dept_name:    { type: 'string' },
          domain_name:  { type: 'string' },
          name:         { type: 'string' },
          actual:       { type: 'number', nullable: true },
          target:       { type: 'number' },
          status:       { type: 'string', enum: ['red', 'yellow'] },
          trend:        { type: 'string', enum: ['up', 'down', 'stable'] },
        },
      },
      User: {
        type: 'object',
        properties: {
          id:         { type: 'integer' },
          email:      { type: 'string', format: 'email' },
          name:       { type: 'string' },
          role:       { type: 'string', enum: ['admin', 'dept_head', 'management', 'public'] },
          dept_id:    { type: 'integer', nullable: true },
          dept_name:  { type: 'string', nullable: true },
          is_active:  { type: 'integer', enum: [0, 1] },
          created_at: { type: 'string', format: 'date-time' },
          last_login: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      KaizenItem: {
        type: 'object',
        properties: {
          id:          { type: 'integer' },
          dept_id:     { type: 'integer' },
          dept_name:   { type: 'string' },
          title:       { type: 'string' },
          description: { type: 'string', nullable: true },
          author_name: { type: 'string', nullable: true },
          status:      { type: 'string', enum: ['new', 'in_progress', 'done', 'rejected'] },
          impact_score:{ type: 'integer', nullable: true, minimum: 1, maximum: 5 },
          created_at:  { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
    },
  },
  security: [],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Авторизация'],
        summary: 'Вход в систему',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email', example: 'admin@svep.ru' },
                  password: { type: 'string', example: 'Admin123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Токены доступа',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken:  { type: 'string' },
                    refreshToken: { type: 'string' },
                    role:         { type: 'string' },
                    name:         { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Неверные учётные данные', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Авторизация'],
        summary: 'Обновить access-токен',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } },
        },
        responses: {
          200: { description: 'Новый access-токен', content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } } },
          401: { description: 'Токен недействителен', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/departments': {
      get: {
        tags: ['Отделы'],
        summary: 'Список всех 16 отделов',
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Department' } } } } },
        },
      },
    },
    '/departments/{id}': {
      get: {
        tags: ['Отделы'],
        summary: 'Один отдел с индикаторами',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Не найден', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/kpi/{dept_id}': {
      get: {
        tags: ['KPI'],
        summary: 'KPI отдела за период',
        parameters: [
          { name: 'dept_id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'year',    in: 'query', schema: { type: 'integer', example: 2026 } },
          { name: 'month',   in: 'query', schema: { type: 'integer', minimum: 1, maximum: 12 } },
        ],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { dept_id: { type: 'integer' }, year: { type: 'integer' }, month: { type: 'integer' }, indicators: { type: 'array', items: { $ref: '#/components/schemas/Indicator' } } } } } } },
          404: { description: 'Отдел не найден' },
        },
      },
    },
    '/kpi/{dept_id}/{indicator_id}': {
      get: {
        tags: ['KPI'],
        summary: 'История одного показателя',
        parameters: [
          { name: 'dept_id',      in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'indicator_id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
      put: {
        tags: ['KPI'],
        summary: 'Ввести / обновить значение KPI',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'dept_id',      in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'indicator_id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/KpiValue' } } },
        },
        responses: {
          200: { description: 'OK' },
          401: { description: 'Требуется авторизация' },
          403: { description: 'Недостаточно прав' },
        },
      },
    },
    '/master': {
      get: {
        tags: ['Мастер-карта'],
        summary: 'Тепловая карта 16×6 (все отделы × все домены)',
        parameters: [
          { name: 'year',  in: 'query', schema: { type: 'integer' } },
          { name: 'month', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/MasterResponse' } } } },
        },
      },
    },
    '/alerts': {
      get: {
        tags: ['Алерты'],
        summary: 'KPI в красной/жёлтой зоне с трендом',
        parameters: [
          { name: 'year',  in: 'query', schema: { type: 'integer' } },
          { name: 'month', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/trends/{dept_id}': {
      get: {
        tags: ['Тренды'],
        summary: 'Динамика score отдела за N месяцев',
        parameters: [
          { name: 'dept_id', in: 'path',  required: true, schema: { type: 'integer' } },
          { name: 'months',  in: 'query', schema: { type: 'integer', default: 6, maximum: 24 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/trends/company/summary': {
      get: {
        tags: ['Тренды'],
        summary: 'Тренд по всему предприятию',
        parameters: [
          { name: 'months', in: 'query', schema: { type: 'integer', default: 12, maximum: 24 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/kaizen': {
      get: {
        tags: ['Кайдзен'],
        summary: 'Список предложений',
        parameters: [
          { name: 'dept_id', in: 'query', schema: { type: 'integer' } },
          { name: 'status',  in: 'query', schema: { type: 'string', enum: ['new', 'in_progress', 'done', 'rejected'] } },
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/KaizenItem' } } } } } },
      },
      post: {
        tags: ['Кайдзен'],
        summary: 'Создать предложение',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['dept_id', 'title'],
                properties: {
                  dept_id:     { type: 'integer' },
                  domain_id:   { type: 'integer', nullable: true },
                  title:       { type: 'string' },
                  description: { type: 'string', nullable: true },
                  author_name: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Создано' } },
      },
    },
    '/users': {
      get: {
        tags: ['Пользователи'],
        summary: 'Список пользователей (management+)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } },
      },
      post: {
        tags: ['Пользователи'],
        summary: 'Создать пользователя (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['email', 'password', 'name', 'role'],
                properties: {
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name:     { type: 'string' },
                  role:     { type: 'string', enum: ['admin', 'dept_head', 'management', 'public'] },
                  dept_id:  { type: 'integer', nullable: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Создан', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer' } } } } } } },
      },
    },
    '/audit': {
      get: {
        tags: ['Аудит'],
        summary: 'Журнал изменений (management+)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'entity',    in: 'query', schema: { type: 'string' } },
          { name: 'action',    in: 'query', schema: { type: 'string' } },
          { name: 'user_id',   in: 'query', schema: { type: 'integer' } },
          { name: 'limit',     in: 'query', schema: { type: 'integer', default: 50, maximum: 200 } },
          { name: 'offset',    in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/health': {
      get: {
        tags: ['Служебные'],
        summary: 'Health-check',
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, ts: { type: 'string' } } } } } } },
      },
    },
  },
};

module.exports = spec;
