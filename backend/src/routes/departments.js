'use strict';

const router = require('express').Router();
const db     = require('../db');

// GET /api/departments  — список всех отделов
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT d.*,
           COUNT(DISTINCT i.id) AS indicator_count
    FROM   departments d
    LEFT JOIN indicators i ON i.dept_id = d.id
    GROUP BY d.id
    ORDER BY d.id
  `).all();
  res.json(rows);
});

// GET /api/departments/:id  — один отдел
router.get('/:id', (req, res) => {
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  if (!dept) return res.status(404).json({ error: 'Отдел не найден' });

  const indicators = db.prepare(`
    SELECT i.*, dom.name_ru AS domain_name, dom.color AS domain_color, dom.code AS domain_code
    FROM   indicators i
    JOIN   domains dom ON dom.id = i.domain_id
    WHERE  i.dept_id = ?
    ORDER  BY dom.sort_order
  `).all(dept.id);

  res.json({ ...dept, indicators });
});

module.exports = router;
