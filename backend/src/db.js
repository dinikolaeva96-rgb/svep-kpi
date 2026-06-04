'use strict';

// Compatibility wrapper: mirrors the better-sqlite3 API (.prepare().all/get/run())
// using sql.js (pure-JS SQLite, no native compilation required).
//
// Usage: call `await db.init()` once in index.js before app.listen().
// After that, all .prepare() calls work synchronously.

const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../db/svep.db');

let _sqlDb = null; // set after init()

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const SQL = await initSqlJs();
  const fileBuffer = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : null;
  _sqlDb = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();
  _sqlDb.run('PRAGMA foreign_keys = ON');
}

// ── Persistence ───────────────────────────────────────────────────────────────
function persist() {
  const data = _sqlDb.export();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ── Param conversion ──────────────────────────────────────────────────────────
// better-sqlite3 named params: stmt.run({ key: val }) for SQL using @key
// sql.js named params:         stmt.run({ '@key': val })
function convertParams(args) {
  if (!args || args.length === 0) return null;
  const first = args[0];
  if (args.length === 1 && first !== null && typeof first === 'object' && !Array.isArray(first)) {
    const result = {};
    for (const [k, v] of Object.entries(first)) {
      result[/^[@$:]/.test(k) ? k : '@' + k] = v;
    }
    return result;
  }
  return args.length === 1 && Array.isArray(first) ? first : Array.from(args);
}

function bindIfNeeded(stmt, p) {
  if (!p) return;
  const empty = Array.isArray(p) ? p.length === 0 : Object.keys(p).length === 0;
  if (!empty) stmt.bind(p);
}

// ── API ───────────────────────────────────────────────────────────────────────
function prepare(sql) {
  return {
    all(...args) {
      const stmt = _sqlDb.prepare(sql);
      bindIfNeeded(stmt, convertParams(args));
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    get(...args) {
      const stmt = _sqlDb.prepare(sql);
      bindIfNeeded(stmt, convertParams(args));
      let row;
      if (stmt.step()) row = stmt.getAsObject();
      stmt.free();
      return row;
    },
    run(...args) {
      const stmt = _sqlDb.prepare(sql);
      const p = convertParams(args);
      const hasParams = p && (Array.isArray(p) ? p.length > 0 : Object.keys(p).length > 0);
      stmt.run(hasParams ? p : undefined);
      stmt.free();
      const lastInsertRowid = _sqlDb.exec('SELECT last_insert_rowid()')[0]?.values[0][0] ?? 0;
      const changes        = _sqlDb.exec('SELECT changes()')[0]?.values[0][0] ?? 0;
      persist();
      return { lastInsertRowid, changes };
    },
  };
}

module.exports = { prepare, init };
