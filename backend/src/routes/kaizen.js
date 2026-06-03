'use strict';

const router = require('express').Router();
const db     = require('../db');
const { requireRole } = require('../middleware/auth');

// GET /api/kaizen?dept_id=&status=
router.get('/', (req, res) => {
  let query = `
    SELECT k.*, d.name_short AS dept_name, dom.name_ru AS domain_name
    FROM   kaizen k
    JOIN   departments d  ON d.id  = k.dept_id
    LEFT JOIN domains dom ON dom.id = k.domain_id
    WHERE 1=1
  `;
  const params = [];
  if (req.query.dept_id) { query += ' AND k.dept_id = ?'; params.push(req.query.dept_id); }
  if (req.query.status)  { query += ' AND k.status = ?';  params.push(req.query.status);  }
  query += ' ORDER BY k.created_at DESC LIMIT 100';

  res.json(db.prepare(query).all(...params));
});

// POST /api/kaizen  — создать предложение
router.post('/', (req, res) => {
  const { dept_id, domain_id, title, description, author_name } = req.body || {};
  if (!dept_id || !title) return res.status(400).json({ error: 'dept_id и title обязательны' });

  const result = db.prepare(`
    INSERT INTO kaizen (dept_id, domain_id, title, description, author_name, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(dept_id, domain_id || null, title, description || null, author_name || null, req.user?.sub ?? null);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PATCH /api/kaizen/:id — обновить статус (dept_head+)
router.patch('/:id', requireRole('dept_head'), (req, res) => {
  const { status, impact_score } = req.body || {};
  const allowed = ['new', 'in_progress', 'done', 'rejected'];
  if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Недопустимый статус' });

  db.prepare(`
    UPDATE kaizen SET
      status       = COALESCE(?, status),
      impact_score = COALESCE(?, impact_score),
      closed_at    = CASE WHEN ? IN ('done','rejected') THEN datetime('now') ELSE closed_at END
    WHERE id = ?
  `).run(status || null, impact_score || null, status || null, req.params.id);

  res.json({ ok: true });
});

module.exports = router;
