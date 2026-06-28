'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');

const ALLOWED = ['admin', 'management'];

// GET all presentations (public — any authenticated user)
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM presentations ORDER BY sort_order, id').all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create
router.post('/', (req, res) => {
  if (!ALLOWED.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
  const { author_name, topic, deadline, status, sort_order } = req.body;
  if (!author_name || !topic) return res.status(400).json({ error: 'author_name and topic required' });
  try {
    const result = db.prepare(
      'INSERT INTO presentations (author_name, topic, deadline, status, sort_order) VALUES (?, ?, ?, ?, ?)'
    ).run(author_name, topic, deadline || null, status || 'planned', sort_order ?? 0);
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update
router.put('/:id', (req, res) => {
  if (!ALLOWED.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
  const { author_name, topic, deadline, status, sort_order } = req.body;
  try {
    db.prepare(
      'UPDATE presentations SET author_name=?, topic=?, deadline=?, status=?, sort_order=?, updated_at=datetime("now") WHERE id=?'
    ).run(author_name, topic, deadline || null, status || 'planned', sort_order ?? 0, req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
router.delete('/:id', (req, res) => {
  if (!ALLOWED.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    db.prepare('DELETE FROM presentations WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
