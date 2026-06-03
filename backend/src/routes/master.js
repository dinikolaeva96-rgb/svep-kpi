'use strict';

const router = require('express').Router();
const db     = require('../db');

// GET /api/master  — агрегированная тепловая карта 16×6
router.get('/', (req, res) => {
  const year  = parseInt(req.query.year)  || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;

  const departments = db.prepare('SELECT * FROM departments ORDER BY id').all();
  const domains     = db.prepare('SELECT * FROM domains ORDER BY sort_order').all();

  // Для каждого отдела × каждого домена — средний % выполнения
  const stmt = db.prepare(`
    SELECT
      i.dept_id,
      dom.code AS domain_code,
      COUNT(i.id)                                          AS indicator_count,
      AVG(CASE WHEN v.actual IS NOT NULL AND i.target > 0
               THEN ROUND(v.actual / i.target * 100, 1)
               ELSE NULL END)                              AS avg_pct,
      SUM(CASE
        WHEN v.actual IS NULL THEN 0
        WHEN i.code LIKE '%incidents%' OR i.code LIKE '%budget_variance%' THEN
          CASE WHEN v.actual <= i.warning_thr  THEN 2
               WHEN v.actual <= i.critical_thr THEN 1
               ELSE 0 END
        ELSE
          CASE WHEN v.actual >= i.warning_thr  THEN 2
               WHEN v.actual >= i.critical_thr THEN 1
               ELSE 0 END
      END) * 1.0 / (COUNT(i.id) * 2) * 100               AS score
    FROM indicators i
    JOIN domains dom ON dom.id = i.domain_id
    LEFT JOIN kpi_values v
           ON v.indicator_id = i.id
          AND v.period_year  = ?
          AND v.period_month = ?
    GROUP BY i.dept_id, dom.code
  `);

  const rawRows = stmt.all(year, month);

  // Превращаем в матрицу { dept_id: { domain_code: { score, avg_pct } } }
  const matrix = {};
  for (const dept of departments) {
    matrix[dept.id] = {};
    for (const dom of domains) matrix[dept.id][dom.code] = { score: null, avg_pct: null };
  }
  for (const row of rawRows) {
    if (matrix[row.dept_id]) {
      matrix[row.dept_id][row.domain_code] = {
        score:   row.score   !== null ? +row.score.toFixed(1)   : null,
        avg_pct: row.avg_pct !== null ? +row.avg_pct.toFixed(1) : null,
      };
    }
  }

  // Суммарный score по отделу
  const deptScores = departments.map((dept) => {
    const vals = Object.values(matrix[dept.id]).map(v => v.score).filter(v => v !== null);
    return {
      ...dept,
      overall_score: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null,
      domains: matrix[dept.id],
    };
  });

  res.json({ year, month, domains, departments: deptScores });
});

module.exports = router;
