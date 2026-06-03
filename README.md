# Экосистема СВЭП — Корпоративный KPI-портал

Веб-портал управления KPI для ООО «Средневолжскэлектропроект» (Казань).  
16 отделов, 96 индикаторов, 6 lean-доменов, JWT-авторизация, TV-дашборд, аудит.

---

## Быстрый старт (Docker)

```bash
cp .env.example .env
# Отредактируйте .env: задайте JWT_SECRET и JWT_REFRESH_SECRET

docker compose up -d
```

- Портал: http://localhost
- API: http://localhost/api
- Swagger: http://localhost/api/docs

---

## Локальный запуск (без Docker)

### Backend

```bash
cd backend
npm install
cp ../.env.example .env   # отредактируйте .env

node db/seed.js           # первичное заполнение БД
npm start                 # запуск на порту 3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # запуск на порту 5173
```

---

## Демо-аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| admin@svep.ru | Admin123! | admin |
| director@svep.ru | Director1! | management |
| ovl.head@svep.ru | OvlHead1! | dept_head |
| public@svep.ru | Public123! | public |

---

## Структура проекта

```
svep-kpi/
├── backend/
│   ├── db/
│   │   ├── schema.sql       # схема БД (SQLite)
│   │   └── seed.js          # генерация данных
│   ├── src/
│   │   ├── index.js         # Express-приложение
│   │   ├── middleware/      # auth, audit
│   │   ├── routes/          # все REST-маршруты
│   │   └── openapi.js       # OpenAPI 3.0 спецификация
│   ├── tests/
│   │   └── api.test.js      # интеграционные тесты
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # все страницы
│   │   ├── components/      # переиспользуемые компоненты
│   │   ├── store/           # Zustand (auth)
│   │   ├── api/             # axios + интерцептор refresh
│   │   └── types/           # TypeScript-интерфейсы
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

---

## API

Полная документация: http://localhost/api/docs (Swagger UI)

Основные эндпоинты:

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/login | Вход |
| POST | /api/auth/refresh | Обновление токена |
| GET | /api/departments | Список отделов |
| GET | /api/departments/:id | Отдел с индикаторами |
| GET | /api/kpi/:dept_id | KPI отдела за период |
| PUT | /api/kpi/:dept_id/:ind_id | Ввод фактического значения |
| GET | /api/master | Мастер-карта (матрица) |
| GET | /api/alerts | Алерты с трендами |
| GET | /api/trends/:dept_id | Тренд отдела |
| GET | /api/kaizen | Кайдзен-предложения |
| GET | /api/users | Пользователи (admin) |
| GET | /api/audit | Журнал аудита |

---

## Интеграционные тесты

```bash
cd backend
# При запущенном backend (порт 3001):
node tests/api.test.js
```

59 тестов — health, auth, departments, KPI, master map, alerts, trends, kaizen, users, indicators, audit, Swagger.

---

## Роли

| Роль | Возможности |
|------|-------------|
| `public` | Просмотр всех страниц |
| `dept_head` | + ввод KPI своего отдела, настройка индикаторов |
| `management` | + просмотр аудит-лога |
| `admin` | + управление пользователями, все права |

---

## Технологии

**Backend**: Node.js 22, Express 4, better-sqlite3, jsonwebtoken, bcryptjs, swagger-ui-express  
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Zustand, react-router-dom v6, axios  
**Инфраструктура**: Docker, nginx, named volumes
