'use strict';

const router = require('express').Router();
const db     = require('../db');
const { requireRole } = require('../middleware/auth');

// GET /api/audit?entity=&entity_id=&user_id=&limit=50&offset=0
router.get('/', requireRole('management'), (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 50, 200);
  const offset = parseInt(req.query.offset) || 0;

  let q = 'SELECT * FROM audit_log WHERE 1=1';
  const params = [];

  if (req.query.entity)    { q += ' AND entity = ?';    params.push(req.query.entity); }
  if (req.query.entity_id) { q += ' AND entity_id = ?'; params.push(req.query.entity_id); }
  if (req.query.user_id)   { q += ' AND user_id = ?';   params.push(req.query.user_id); }
  if (req.query.action)    { q += ' AND action = ?';    params.push(req.query.action); }

  const total = db.prepare(q.replace('SELECT *', 'SELECT COUNT(*) as n')).get(...params).n;

  q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(q).all(...params).map(r => ({
    ...r,
    old_value: r.old_value ? JSON.parse(r.old_value) : null,
    new_value: r.new_value ? JSON.parse(r.new_value) : null,
  }));

  res.json({ total, limit, offset, rows });
});

module.exports = router;
