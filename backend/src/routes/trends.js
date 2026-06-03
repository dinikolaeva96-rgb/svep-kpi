'use strict';

const router = require('express').Router();
const db     = require('../db');

/**
 * GET /api/trends/:dept_id?months=6
 * Динамика суммарного score отдела за N месяцев
 */
router.get('/:dept_id', (req, res) => {
  const deptId = parseInt(req.params.dept_id);
  const months = Math.min(parseInt(req.query.months) || 6, 24);

  const dept = db.prepare('SELECT id FROM departments WHERE id = ?').get(deptId);
  if (!dept) return res.status(404).json({ error: 'Отдел не найден' });

  // Последние N периодов с данными
  const periods = db.prepare(`
    SELECT DISTINCT period_year, period_month
    FROM kpi_values v
    JOIN indicators i ON i.id = v.indicator_id
    WHERE i.dept_id = ?
    ORDER BY period_year DESC, period_month DESC
    LIMIT ?
  `).all(deptId, months);

  const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

  const points = periods.reverse().map(p => {
    const row = db.prepare(`
      SELECT
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
        END) * 1.0 / (COUNT(i.id) * 2) * 100 AS score
      FROM indicators i
      LEFT JOIN kpi_values v
             ON v.indicator_id = i.id
            AND v.period_year  = ?
            AND v.period_month = ?
      WHERE i.dept_id = ?
    `).get(p.period_year, p.period_month, deptId);

    return {
      year:  p.period_year,
      month: p.period_month,
      label: `${MONTH_NAMES[p.period_month - 1]} ${p.period_year}`,
      score: row?.score != null ? +row.score.toFixed(1) : null,
    };
  });

  res.json({ dept_id: deptId, points });
});

/**
 * GET /api/trends/company?months=6
 * Динамика среднего score по предприятию
 */
router.get('/company/summary', (req, res) => {
  const months = Math.min(parseInt(req.query.months) || 6, 24);

  const periods = db.prepare(`
    SELECT DISTINCT period_year, period_month
    FROM kpi_values
    ORDER BY period_year DESC, period_month DESC
    LIMIT ?
  `).all(months);

  const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

  const points = periods.reverse().map(p => {
    const row = db.prepare(`
      SELECT
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
        END) * 1.0 / (COUNT(i.id) * 2) * 100 AS score
      FROM indicators i
      LEFT JOIN kpi_values v
             ON v.indicator_id = i.id
            AND v.period_year  = ?
            AND v.period_month = ?
    `).get(p.period_year, p.period_month);

    return {
      year:  p.period_year,
      month: p.period_month,
      label: `${MONTH_NAMES[p.period_month - 1]} ${p.period_year}`,
      score: row?.score != null ? +row.score.toFixed(1) : null,
    };
  });

  res.json({ points });
});

module.exports = router;
