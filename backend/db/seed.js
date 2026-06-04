'use strict';

const path      = require('path');
const fs        = require('fs');
const initSqlJs = require('sql.js');
const bcrypt    = require('bcryptjs');

const DB_PATH     = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(__dirname, 'svep.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function seed() {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const SQL = await initSqlJs();
  const db  = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON');
  db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

  // ── Helpers ────────────────────────────────────────────────────────────────
  // Convert plain-object { key: val } → { '@key': val } for sql.js named params
  function np(obj) {
    const r = {};
    for (const [k, v] of Object.entries(obj)) r['@' + k] = v;
    return r;
  }

  function run(sql, params) {
    const stmt = db.prepare(sql);
    stmt.run(params ? np(params) : undefined);
    stmt.free();
  }

  function get(sql, param) {
    const stmt = db.prepare(sql);
    if (param !== undefined) stmt.bind([param]);
    let row;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  function all(sql) {
    const stmt = db.prepare(sql);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  // ── Домены ──────────────────────────────────────────────────────────────────
  const domains = [
    { code: 'quality',    name_ru: 'Качество',      color: '#3B82F6', icon: '🏆', sort_order: 1 },
    { code: 'delivery',   name_ru: 'Сроки',          color: '#10B981', icon: '⏱️', sort_order: 2 },
    { code: 'cost',       name_ru: 'Затраты',        color: '#F59E0B', icon: '💰', sort_order: 3 },
    { code: 'safety',     name_ru: 'Безопасность',   color: '#EF4444', icon: '🛡️', sort_order: 4 },
    { code: 'morale',     name_ru: 'Вовлечённость',  color: '#8B5CF6', icon: '❤️', sort_order: 5 },
    { code: 'innovation', name_ru: 'Инновации',      color: '#EC4899', icon: '💡', sort_order: 6 },
  ];
  for (const d of domains) {
    run('INSERT INTO domains (code, name_ru, color, icon, sort_order) VALUES (@code, @name_ru, @color, @icon, @sort_order)', d);
  }

  // ── 16 отделов ──────────────────────────────────────────────────────────────
  const departments = [
    { code: 'OVL',   name_short: 'ОВЛ',    name_full: 'Отдел воздушных линий',                             staff_count: 12 },
    { code: 'ORZiA', name_short: 'ОРЗиА',  name_full: 'Отдел релейной защиты и автоматики',               staff_count: 8  },
    { code: 'OPS',   name_short: 'ОПС',    name_full: 'Отдел подстанций',                                  staff_count: 10 },
    { code: 'OII',   name_short: 'ОИИ',    name_full: 'Отдел инженерных изысканий',                        staff_count: 6  },
    { code: 'ORS',   name_short: 'ОРС',    name_full: 'Отдел разработки систем',                           staff_count: 7  },
    { code: 'SO_RS', name_short: 'СО РС',  name_full: 'Сектор отдела распределительных сетей',            staff_count: 5  },
    { code: 'OSDUE', name_short: 'ОСДУЭ',  name_full: 'Отдел систем диспетчерского управления энергетикой', staff_count: 6 },
    { code: 'SO_OS', name_short: 'СО ОС',  name_full: 'Сектор отдела общих систем',                       staff_count: 4  },
    { code: 'TO',    name_short: 'ТО',     name_full: 'Технический отдел',                                 staff_count: 9  },
    { code: 'OUP',   name_short: 'ОУП',    name_full: 'Отдел управления проектами',                        staff_count: 7  },
    { code: 'TIM',   name_short: 'ТИМ',    name_full: 'Отдел технологий информационного моделирования',   staff_count: 5  },
    { code: 'StO',   name_short: 'СтО',    name_full: 'Сметный отдел',                                    staff_count: 8  },
    { code: 'HR',    name_short: 'HR',     name_full: 'Отдел кадров',                                     staff_count: 4  },
    { code: 'ODO',   name_short: 'ОДО',    name_full: 'Отдел делопроизводства и организации',             staff_count: 5  },
    { code: 'SNAB',  name_short: 'Снаб.',  name_full: 'Отдел снабжения',                                  staff_count: 4  },
    { code: 'BUHG',  name_short: 'Бухг.',  name_full: 'Бухгалтерия',                                     staff_count: 6  },
  ];
  for (const d of departments) {
    run('INSERT INTO departments (code, name_short, name_full, staff_count) VALUES (@code, @name_short, @name_full, @staff_count)', d);
  }

  // ── Индикаторы KPI ──────────────────────────────────────────────────────────
  const dIds = {};
  for (const d of domains) dIds[d.code] = get('SELECT id FROM domains WHERE code = ?', d.code).id;

  function makeKpi(deptCode) {
    const deptId = get('SELECT id FROM departments WHERE code = ?', deptCode).id;
    const indicators = [
      { domain: 'quality',    code: 'quality_score',  name: 'Индекс качества',       unit: '%',    target: 95, warning_thr: 85, critical_thr: 75, weight: 1.5, description: 'Доля проектов без замечаний' },
      { domain: 'delivery',   code: 'on_time_rate',    name: 'Соблюдение сроков',     unit: '%',    target: 90, warning_thr: 80, critical_thr: 70, weight: 1.5, description: 'Доля задач сданных в срок'   },
      { domain: 'cost',       code: 'budget_variance', name: 'Отклонение от бюджета', unit: '%',    target: 5,  warning_thr: 10, critical_thr: 20, weight: 1.0, description: 'Превышение плановых затрат'   },
      { domain: 'safety',     code: 'incidents',       name: 'Инциденты / нарушения', unit: 'шт',   target: 0,  warning_thr: 1,  critical_thr: 3,  weight: 2.0, description: 'Кол-во зафиксированных нарушений' },
      { domain: 'morale',     code: 'engagement',      name: 'Вовлечённость',         unit: 'балл', target: 4,  warning_thr: 3,  critical_thr: 2,  weight: 1.0, description: 'Средний балл опроса сотрудников' },
      { domain: 'innovation', code: 'kaizen_count',    name: 'Кайдзен-предложения',   unit: 'шт',   target: 3,  warning_thr: 1,  critical_thr: 0,  weight: 1.0, description: 'Принятых предложений за квартал' },
    ];
    for (const ind of indicators) {
      run(
        'INSERT INTO indicators (dept_id, domain_id, code, name, unit, target, warning_thr, critical_thr, weight, description) VALUES (@dept_id, @domain_id, @code, @name, @unit, @target, @warning_thr, @critical_thr, @weight, @description)',
        { dept_id: deptId, domain_id: dIds[ind.domain], code: `${deptCode}_${ind.code}`, name: ind.name, unit: ind.unit, target: ind.target, warning_thr: ind.warning_thr, critical_thr: ind.critical_thr, weight: ind.weight, description: ind.description }
      );
    }
  }
  for (const dept of departments) makeKpi(dept.code);

  // ── Демо-значения KPI (2025–2026) ──────────────────────────────────────────
  const allIndicators = all('SELECT id, target FROM indicators');
  const rand = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

  for (const ind of allIndicators) {
    for (let month = 1; month <= 12; month++) {
      run('INSERT INTO kpi_values (indicator_id, period_year, period_month, actual, plan) VALUES (@indicator_id, @period_year, @period_month, @actual, @plan)',
        { indicator_id: ind.id, period_year: 2025, period_month: month, plan: ind.target, actual: rand(ind.target * 0.7, ind.target * 1.1) });
    }
    for (let month = 1; month <= 5; month++) {
      run('INSERT INTO kpi_values (indicator_id, period_year, period_month, actual, plan) VALUES (@indicator_id, @period_year, @period_month, @actual, @plan)',
        { indicator_id: ind.id, period_year: 2026, period_month: month, plan: ind.target, actual: rand(ind.target * 0.8, ind.target * 1.05) });
    }
  }

  // ── Пользователи ────────────────────────────────────────────────────────────
  const hash  = (pw) => bcrypt.hashSync(pw, 10);
  const ovlId = get('SELECT id FROM departments WHERE code = ?', 'OVL').id;

  const userSql = 'INSERT INTO users (email, password_hash, name, role, dept_id) VALUES (@email, @password_hash, @name, @role, @dept_id)';
  run(userSql, { email: 'admin@svep.ru',    password_hash: hash('Admin123!'),  name: 'Администратор',       role: 'admin',      dept_id: null });
  run(userSql, { email: 'director@svep.ru', password_hash: hash('Director1!'), name: 'Генеральный директор', role: 'management', dept_id: null });
  run(userSql, { email: 'ovl.head@svep.ru', password_hash: hash('OvlHead1!'),  name: 'Начальник ОВЛ',       role: 'dept_head',  dept_id: ovlId });
  run(userSql, { email: 'public@svep.ru',   password_hash: hash('Public123!'), name: 'Публичный экран',     role: 'public',     dept_id: null });

  // ── Сохранить на диск ───────────────────────────────────────────────────────
  const data = db.export();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));

  console.log('✅  База данных инициализирована:', DB_PATH);
  console.log(`   Доменов: ${get('SELECT COUNT(*) as n FROM domains').n}`);
  console.log(`   Отделов: ${get('SELECT COUNT(*) as n FROM departments').n}`);
  console.log(`   Индикаторов: ${get('SELECT COUNT(*) as n FROM indicators').n}`);
  console.log(`   Значений KPI: ${get('SELECT COUNT(*) as n FROM kpi_values').n}`);
  console.log(`   Пользователей: ${get('SELECT COUNT(*) as n FROM users').n}`);
}

seed().catch(err => { console.error('Ошибка:', err); process.exit(1); });
