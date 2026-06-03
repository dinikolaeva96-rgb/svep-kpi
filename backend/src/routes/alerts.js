'use strict';

const router = require('express').Router();
const db     = require('../db');

/**
 * GET /api/alerts?year=&month=
 * Возвращает все индикаторы в красной/жёлтой зоне за период
 * с трендом (сравнение с предыдущим месяцем)
 */
router.get('/', (req, res) => {
  const year  = parseInt(req.query.year)  || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;

  // Предыдущий период
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear  = month === 1 ? year - 1 : year;

  const rows = db.prepare(`
    SELECT
      i.id        AS indicator_id,
      i.code,
      i.name,
      i.unit,
      i.target,
      i.warning_thr,
      i.critical_thr,
      i.weight,
      d.id        AS dept_id,
      d.name_short AS dept_name,
      dom.code    AS domain_code,
      dom.name_ru AS domain_name,
      dom.color   AS domain_color,
      dom.icon    AS domain_icon,
      v.actual,
      v.plan,
      v.comment,
      vp.actual   AS prev_actual,
      CASE
        WHEN v.actual IS NULL THEN 'no_data'
        WHEN i.code LIKE '%incidents%' OR i.code LIKE '%budget_variance%' THEN
          CASE WHEN v.actual <= i.warning_thr  THEN 'green'
               WHEN v.actual <= i.critical_thr THEN 'yellow'
               ELSE 'red' END
        ELSE
          CASE WHEN v.actual >= i.warning_thr  THEN 'green'
               WHEN v.actual >= i.critical_thr THEN 'yellow'
               ELSE 'red' END
      END AS status
    FROM indicators i
    JOIN departments d  ON d.id  = i.dept_id
    JOIN domains dom    ON dom.id = i.domain_id
    LEFT JOIN kpi_values v
           ON v.indicator_id = i.id
          AND v.period_year  = ?
          AND v.period_month = ?
    LEFT JOIN kpi_values vp
           ON vp.indicator_id = i.id
          AND vp.period_year  = ?
          AND vp.period_month = ?
  `).all(year, month, prevYear, prevMonth);

  // Фильтруем только проблемные
  const alerts = rows
    .filter(r => r.status === 'red' || r.status === 'yellow')
    .map(r => {
      let trend = 'stable';
      if (r.actual != null && r.prev_actual != null) {
        const isInverse = r.code.includes('incidents') || r.code.includes('budget_variance');
        if (!isInverse) {
          trend = r.actual > r.prev_actual ? 'up' : r.actual < r.prev_actual ? 'down' : 'stable';
        } else {
          trend = r.actual < r.prev_actual ? 'up' : r.actual > r.prev_actual ? 'down' : 'stable';
        }
      }
      return { ...r, trend };
    })
    .sort((a, b) => {
      const order = { red: 0, yellow: 1 };
      return (order[a.status] ?? 2) - (order[b.status] ?? 2);
    });

  // Сводка
  const summary = {
    total:    rows.length,
    red:      alerts.filter(a => a.status === 'red').length,
    yellow:   alerts.filter(a => a.status === 'yellow').length,
    no_data:  rows.filter(r => r.status === 'no_data').length,
    green:    rows.filter(r => r.status === 'green').length,
  };

  res.json({ year, month, summary, alerts });
});

module.exports = router;
