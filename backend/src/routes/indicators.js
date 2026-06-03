'use strict';

const router = require('express').Router();
const db     = require('../db');
const { requireRole } = require('../middleware/auth');
const { audit }       = require('../middleware/audit');

// GET /api/indicators?dept_id=
router.get('/', requireRole('dept_head'), (req, res) => {
  let q = `
    SELECT i.*, d.name_short AS dept_name, dom.name_ru AS domain_name, dom.code AS domain_code, dom.color AS domain_color
    FROM   indicators i
    JOIN   departments d  ON d.id  = i.dept_id
    JOIN   domains dom    ON dom.id = i.domain_id
    WHERE  1=1
  `;
  const params = [];
  if (req.query.dept_id) { q += ' AND i.dept_id = ?'; params.push(req.query.dept_id); }
  q += ' ORDER BY d.id, dom.sort_order';
  res.json(db.prepare(q).all(...params));
});

// GET /api/indicators/:id
router.get('/:id', requireRole('dept_head'), (req, res) => {
  const row = db.prepare(`
    SELECT i.*, d.name_short AS dept_name, dom.name_ru AS domain_name, dom.code AS domain_code
    FROM   indicators i
    JOIN   departments d  ON d.id  = i.dept_id
    JOIN   domains dom    ON dom.id = i.domain_id
    WHERE  i.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Показатель не найден' });
  res.json(row);
});

// PATCH /api/indicators/:id  — обновить цель/пороги/вес/описание
router.patch('/:id', requireRole('dept_head'), (req, res) => {
  const ind = db.prepare('SELECT * FROM indicators WHERE id = ?').get(req.params.id);
  if (!ind) return res.status(404).json({ error: 'Показатель не найден' });

  // dept_head может только свой отдел
  if (req.user.role === 'dept_head' && req.user.dept_id !== ind.dept_id) {
    return res.status(403).json({ error: 'Нет доступа к этому отделу' });
  }

  const { target, warning_thr, critical_thr, weight, name, description, unit } = req.body || {};

  // Валидация порогов
  if (target    !== undefined && isNaN(target))    return res.status(400).json({ error: 'target должен быть числом' });
  if (weight    !== undefined && (weight < 0 || weight > 5)) return res.status(400).json({ error: 'weight: 0–5' });

  db.prepare(`
    UPDATE indicators SET
      target       = COALESCE(?, target),
      warning_thr  = COALESCE(?, warning_thr),
      critical_thr = COALESCE(?, critical_thr),
      weight       = COALESCE(?, weight),
      name         = COALESCE(?, name),
      description  = COALESCE(?, description),
      unit         = COALESCE(?, unit)
    WHERE id = ?
  `).run(
    target ?? null, warning_thr ?? null, critical_thr ?? null,
    weight ?? null, name ?? null, description ?? null, unit ?? null,
    ind.id
  );

  const updated = db.prepare('SELECT * FROM indicators WHERE id = ?').get(ind.id);
  audit(req, 'update', 'indicator', ind.id, ind, updated);
  res.json({ ok: true, indicator: updated });
});

module.exports = router;
