'use strict';

const router = require('express').Router();
const db     = require('../db');
const { requireRole } = require('../middleware/auth');

// GET /api/kpi/:dept_id  — все KPI отдела с последними значениями
router.get('/:dept_id', (req, res) => {
  const dept = db.prepare('SELECT id FROM departments WHERE id = ?').get(req.params.dept_id);
  if (!dept) return res.status(404).json({ error: 'Отдел не найден' });

  const year  = parseInt(req.query.year)  || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;

  const rows = db.prepare(`
    SELECT
      i.*,
      dom.code  AS domain_code,
      dom.name_ru AS domain_name,
      dom.color   AS domain_color,
      v.actual, v.plan, v.period_year, v.period_month, v.comment,
      CASE
        WHEN v.actual IS NULL THEN 'no_data'
        -- для показателей где меньше = лучше (incidents, budget_variance)
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
    JOIN domains dom ON dom.id = i.domain_id
    LEFT JOIN kpi_values v
           ON v.indicator_id = i.id
          AND v.period_year  = ?
          AND v.period_month = ?
    WHERE i.dept_id = ?
    ORDER BY dom.sort_order
  `).all(year, month, dept.id);

  res.json({ dept_id: dept.id, year, month, indicators: rows });
});

// GET /api/kpi/:dept_id/:indicator_id  — история одного показателя
router.get('/:dept_id/:indicator_id', (req, res) => {
  const indicator = db.prepare(`
    SELECT i.*, dom.name_ru AS domain_name, dom.color AS domain_color
    FROM   indicators i
    JOIN   domains dom ON dom.id = i.domain_id
    WHERE  i.id = ? AND i.dept_id = ?
  `).get(req.params.indicator_id, req.params.dept_id);

  if (!indicator) return res.status(404).json({ error: 'Показатель не найден' });

  const history = db.prepare(`
    SELECT * FROM kpi_values
    WHERE indicator_id = ?
    ORDER BY period_year, period_month
  `).all(indicator.id);

  res.json({ indicator, history });
});

// PUT /api/kpi/:dept_id/:indicator_id  — обновить значение (dept_head+)
router.put('/:dept_id/:indicator_id', requireRole('dept_head'), (req, res) => {
  const { year, month, actual, plan, comment } = req.body || {};
  if (!year || !month) return res.status(400).json({ error: 'year и month обязательны' });

  const indicator = db.prepare('SELECT id FROM indicators WHERE id = ? AND dept_id = ?')
    .get(req.params.indicator_id, req.params.dept_id);
  if (!indicator) return res.status(404).json({ error: 'Показатель не найден' });

  db.prepare(`
    INSERT INTO kpi_values (indicator_id, period_year, period_month, actual, plan, comment, entered_by)
    VALUES (@indicator_id, @year, @month, @actual, @plan, @comment, @entered_by)
    ON CONFLICT(indicator_id, period_year, period_month) DO UPDATE SET
      actual     = excluded.actual,
      plan       = excluded.plan,
      comment    = excluded.comment,
      entered_by = excluded.entered_by,
      entered_at = datetime('now')
  `).run({
    indicator_id: indicator.id,
    year, month, actual, plan, comment,
    entered_by: req.user?.sub ?? null,
  });

  res.json({ ok: true });
});

module.exports = router;
