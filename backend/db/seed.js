'use strict';

const path = require('path');
const fs   = require('fs');
const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');

const DB_PATH     = path.join(__dirname, 'svep.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Удалить старую БД при повторном запуске
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Применить схему
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// ── Домены (6 lean-категорий) ────────────────────────────────────────────────
const domains = [
  { code: 'quality',    name_ru: 'Качество',      color: '#3B82F6', icon: '🏆', sort_order: 1 },
  { code: 'delivery',   name_ru: 'Сроки',          color: '#10B981', icon: '⏱️', sort_order: 2 },
  { code: 'cost',       name_ru: 'Затраты',        color: '#F59E0B', icon: '💰', sort_order: 3 },
  { code: 'safety',     name_ru: 'Безопасность',   color: '#EF4444', icon: '🛡️', sort_order: 4 },
  { code: 'morale',     name_ru: 'Вовлечённость',  color: '#8B5CF6', icon: '❤️', sort_order: 5 },
  { code: 'innovation', name_ru: 'Инновации',      color: '#EC4899', icon: '💡', sort_order: 6 },
];

const insertDomain = db.prepare(
  'INSERT INTO domains (code, name_ru, color, icon, sort_order) VALUES (@code, @name_ru, @color, @icon, @sort_order)'
);
for (const d of domains) insertDomain.run(d);

// ── 16 отделов ───────────────────────────────────────────────────────────────
const departments = [
  { code: 'OVL',    name_short: 'ОВЛ',    name_full: 'Отдел воздушных линий',                          staff_count: 12 },
  { code: 'ORZiA',  name_short: 'ОРЗиА',  name_full: 'Отдел релейной защиты и автоматики',              staff_count: 8  },
  { code: 'OPS',    name_short: 'ОПС',    name_full: 'Отдел подстанций',                                staff_count: 10 },
  { code: 'OII',    name_short: 'ОИИ',    name_full: 'Отдел инженерных изысканий',                      staff_count: 6  },
  { code: 'ORS',    name_short: 'ОРС',    name_full: 'Отдел разработки систем',                         staff_count: 7  },
  { code: 'SO_RS',  name_short: 'СО РС',  name_full: 'Сектор отдела распределительных сетей',           staff_count: 5  },
  { code: 'OSDUE',  name_short: 'ОСДУЭ',  name_full: 'Отдел систем диспетчерского управления энергетикой', staff_count: 6 },
  { code: 'SO_OS',  name_short: 'СО ОС',  name_full: 'Сектор отдела общих систем',                     staff_count: 4  },
  { code: 'TO',     name_short: 'ТО',     name_full: 'Технический отдел',                               staff_count: 9  },
  { code: 'OUP',    name_short: 'ОУП',    name_full: 'Отдел управления проектами',                      staff_count: 7  },
  { code: 'TIM',    name_short: 'ТИМ',    name_full: 'Отдел технологий информационного моделирования',  staff_count: 5  },
  { code: 'StO',    name_short: 'СтО',    name_full: 'Сметный отдел',                                   staff_count: 8  },
  { code: 'HR',     name_short: 'HR',     name_full: 'Отдел кадров',                                    staff_count: 4  },
  { code: 'ODO',    name_short: 'ОДО',    name_full: 'Отдел делопроизводства и организации',            staff_count: 5  },
  { code: 'SNAB',   name_short: 'Снаб.',  name_full: 'Отдел снабжения',                                 staff_count: 4  },
  { code: 'BUHG',   name_short: 'Бухг.',  name_full: 'Бухгалтерия',                                    staff_count: 6  },
];

const insertDept = db.prepare(`
  INSERT INTO departments (code, name_short, name_full, staff_count)
  VALUES (@code, @name_short, @name_full, @staff_count)
`);
for (const d of departments) insertDept.run(d);

// ── Индикаторы KPI (по 6 на отдел, по одному на домен) ───────────────────────
const domainRow = db.prepare('SELECT id FROM domains WHERE code = ?');
const dIds = {};
for (const d of domains) dIds[d.code] = domainRow.get(d.code).id;

const deptRow = db.prepare('SELECT id FROM departments WHERE code = ?');

const insertIndicator = db.prepare(`
  INSERT INTO indicators (dept_id, domain_id, code, name, unit, target, warning_thr, critical_thr, weight, description)
  VALUES (@dept_id, @domain_id, @code, @name, @unit, @target, @warning_thr, @critical_thr, @weight, @description)
`);

// Шаблон 6 KPI на отдел (переопределяется для каждого отдела)
function makeKpi(deptCode, overrides = []) {
  const deptId = deptRow.get(deptCode).id;
  const defaults = [
    { domain: 'quality',    code: 'quality_score',   name: 'Индекс качества',           unit: '%',    target: 95, warning_thr: 85, critical_thr: 75, weight: 1.5, description: 'Доля проектов без замечаний' },
    { domain: 'delivery',   code: 'on_time_rate',     name: 'Соблюдение сроков',         unit: '%',    target: 90, warning_thr: 80, critical_thr: 70, weight: 1.5, description: 'Доля задач сданных в срок'   },
    { domain: 'cost',       code: 'budget_variance',  name: 'Отклонение от бюджета',     unit: '%',    target: 5,  warning_thr: 10, critical_thr: 20, weight: 1.0, description: 'Превышение плановых затрат'   },
    { domain: 'safety',     code: 'incidents',        name: 'Инциденты / нарушения',     unit: 'шт',   target: 0,  warning_thr: 1,  critical_thr: 3,  weight: 2.0, description: 'Кол-во зафиксированных нарушений' },
    { domain: 'morale',     code: 'engagement',       name: 'Вовлечённость',             unit: 'балл', target: 4,  warning_thr: 3,  critical_thr: 2,  weight: 1.0, description: 'Средний балл опроса сотрудников' },
    { domain: 'innovation', code: 'kaizen_count',     name: 'Кайдзен-предложения',       unit: 'шт',   target: 3,  warning_thr: 1,  critical_thr: 0,  weight: 1.0, description: 'Принятых предложений за квартал' },
  ];
  const merged = defaults.map((def, i) => ({ ...def, ...(overrides[i] || {}) }));
  for (const ind of merged) {
    insertIndicator.run({
      dept_id:      deptId,
      domain_id:    dIds[ind.domain],
      code:         `${deptCode}_${ind.code}`,
      name:         ind.name,
      unit:         ind.unit,
      target:       ind.target,
      warning_thr:  ind.warning_thr,
      critical_thr: ind.critical_thr,
      weight:       ind.weight,
      description:  ind.description,
    });
  }
}

for (const dept of departments) makeKpi(dept.code);

// ── Демо-значения KPI (2025–2026) ────────────────────────────────────────────
const allIndicators = db.prepare('SELECT id, target FROM indicators').all();
const insertValue   = db.prepare(`
  INSERT INTO kpi_values (indicator_id, period_year, period_month, actual, plan)
  VALUES (@indicator_id, @period_year, @period_month, @actual, @plan)
`);

const rand = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

for (const ind of allIndicators) {
  for (let month = 1; month <= 12; month++) {
    insertValue.run({
      indicator_id: ind.id,
      period_year:  2025,
      period_month: month,
      plan:         ind.target,
      actual:       rand(ind.target * 0.7, ind.target * 1.1),
    });
  }
  for (let month = 1; month <= 5; month++) {
    insertValue.run({
      indicator_id: ind.id,
      period_year:  2026,
      period_month: month,
      plan:         ind.target,
      actual:       rand(ind.target * 0.8, ind.target * 1.05),
    });
  }
}

// ── Пользователи ─────────────────────────────────────────────────────────────
const insertUser = db.prepare(`
  INSERT INTO users (email, password_hash, name, role, dept_id)
  VALUES (@email, @password_hash, @name, @role, @dept_id)
`);

const hash = (pw) => bcrypt.hashSync(pw, 10);

insertUser.run({ email: 'admin@svep.ru',      password_hash: hash('Admin123!'),   name: 'Администратор',      role: 'admin',      dept_id: null });
insertUser.run({ email: 'director@svep.ru',   password_hash: hash('Director1!'),  name: 'Генеральный директор', role: 'management', dept_id: null });
insertUser.run({ email: 'ovl.head@svep.ru',   password_hash: hash('OvlHead1!'),   name: 'Начальник ОВЛ',      role: 'dept_head',  dept_id: deptRow.get('OVL').id });
insertUser.run({ email: 'public@svep.ru',     password_hash: hash('Public123!'),  name: 'Публичный экран',    role: 'public',     dept_id: null });

console.log('✅  База данных инициализирована:', DB_PATH);
console.log(`   Доменов: ${db.prepare('SELECT COUNT(*) as n FROM domains').get().n}`);
console.log(`   Отделов: ${db.prepare('SELECT COUNT(*) as n FROM departments').get().n}`);
console.log(`   Индикаторов: ${db.prepare('SELECT COUNT(*) as n FROM indicators').get().n}`);
console.log(`   Значений KPI: ${db.prepare('SELECT COUNT(*) as n FROM kpi_values').get().n}`);
console.log(`   Пользователей: ${db.prepare('SELECT COUNT(*) as n FROM users').get().n}`);
