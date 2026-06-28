PRAGMA foreign_keys = ON;

-- Домены (6 lean-категорий)
CREATE TABLE IF NOT EXISTS domains (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  code      TEXT NOT NULL UNIQUE,  -- quality, delivery, cost, safety, morale, innovation
  name_ru   TEXT NOT NULL,
  color     TEXT NOT NULL,
  icon      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Отделы
CREATE TABLE IF NOT EXISTS departments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,
  name_short  TEXT NOT NULL,
  name_full   TEXT NOT NULL,
  head_name   TEXT,
  head_email  TEXT,
  staff_count INTEGER NOT NULL DEFAULT 0,
  domain_lead TEXT,    -- primary lean domain
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Показатели (справочник KPI)
CREATE TABLE IF NOT EXISTS indicators (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  dept_id      INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  domain_id    INTEGER NOT NULL REFERENCES domains(id),
  code         TEXT NOT NULL,
  name         TEXT NOT NULL,
  unit         TEXT NOT NULL DEFAULT '%',
  target       REAL NOT NULL,
  warning_thr  REAL NOT NULL,  -- порог "предупреждение" (ниже = жёлтый)
  critical_thr REAL NOT NULL,  -- порог "критично" (ниже = красный)
  weight       REAL NOT NULL DEFAULT 1.0,
  description  TEXT,
  formula      TEXT,
  data_source  TEXT,
  UNIQUE(dept_id, code)
);

-- Значения KPI (временной ряд)
CREATE TABLE IF NOT EXISTS kpi_values (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  indicator_id INTEGER NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  period_year  INTEGER NOT NULL,
  period_month INTEGER NOT NULL CHECK(period_month BETWEEN 1 AND 12),
  actual       REAL,
  plan         REAL,
  comment      TEXT,
  entered_by   INTEGER REFERENCES users(id),
  entered_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(indicator_id, period_year, period_month)
);

-- Кайдзен-предложения
CREATE TABLE IF NOT EXISTS kaizen (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  dept_id      INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  domain_id    INTEGER REFERENCES domains(id),
  title        TEXT NOT NULL,
  description  TEXT,
  author_name  TEXT,
  author_id    INTEGER REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'new'
                 CHECK(status IN ('new','in_progress','done','rejected')),
  impact_score INTEGER CHECK(impact_score BETWEEN 1 AND 5),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at    DATETIME
);

-- Пользователи (авторизация)
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'public'
                 CHECK(role IN ('admin','dept_head','management','public')),
  dept_id      INTEGER REFERENCES departments(id),
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login   DATETIME
);

-- Сессии / refresh-токены
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Журнал аудита
CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id),
  user_name  TEXT,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  INTEGER,
  old_value  TEXT,
  new_value  TEXT,
  ip         TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_audit_entity         ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user           ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_indicator ON kpi_values(indicator_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_period    ON kpi_values(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_kaizen_dept          ON kaizen(dept_id);
CREATE INDEX IF NOT EXISTS idx_kaizen_status        ON kaizen(status);
CREATE INDEX IF NOT EXISTS idx_indicators_dept      ON indicators(dept_id);

CREATE TABLE IF NOT EXISTS presentations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  deadline TEXT,
  status TEXT DEFAULT 'planned' CHECK(status IN ('planned','in_progress','done')),
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
