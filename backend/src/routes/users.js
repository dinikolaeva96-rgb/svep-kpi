'use strict';

const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db');
const { requireRole }  = require('../middleware/auth');
const { audit }        = require('../middleware/audit');

const SELECT_USERS = `
  SELECT u.id, u.email, u.name, u.role, u.dept_id, u.is_active, u.created_at, u.last_login,
         d.name_short AS dept_name
  FROM   users u
  LEFT JOIN departments d ON d.id = u.dept_id
`;

// GET /api/users  — список (admin/management)
router.get('/', requireRole('management'), (req, res) => {
  const rows = db.prepare(SELECT_USERS + ' ORDER BY u.id').all();
  res.json(rows);
});

// GET /api/users/:id
router.get('/:id', requireRole('management'), (req, res) => {
  const row = db.prepare(SELECT_USERS + ' WHERE u.id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(row);
});

// POST /api/users  — создать (admin)
router.post('/', requireRole('admin'), (req, res) => {
  const { email, password, name, role, dept_id } = req.body || {};
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'email, password, name, role — обязательны' });
  }
  const ROLES = ['admin', 'dept_head', 'management', 'public'];
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Недопустимая роль' });
  if (password.length < 8)   return res.status(400).json({ error: 'Пароль min 8 символов' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email уже занят' });

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, dept_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(email, bcrypt.hashSync(password, 10), name, role, dept_id || null);

  audit(req, 'create', 'user', result.lastInsertRowid, null, { email, name, role, dept_id });
  res.status(201).json({ id: result.lastInsertRowid });
});

// PATCH /api/users/:id  — обновить роль/отдел/статус (admin)
router.patch('/:id', requireRole('admin'), (req, res) => {
  const user = db.prepare(`SELECT id, email, name, role, dept_id, is_active, created_at, last_login FROM users WHERE id = ?`).get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  // Нельзя деактивировать себя
  if (req.user?.sub === user.id && req.body?.is_active === 0) {
    return res.status(400).json({ error: 'Нельзя деактивировать себя' });
  }

  const { name, role, dept_id, is_active } = req.body || {};
  const ROLES = ['admin', 'dept_head', 'management', 'public'];
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: 'Недопустимая роль' });

  db.prepare(`
    UPDATE users SET
      name      = COALESCE(?, name),
      role      = COALESCE(?, role),
      dept_id   = CASE WHEN ? IS NOT NULL THEN ? ELSE dept_id END,
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    name    ?? null,
    role    ?? null,
    dept_id !== undefined ? dept_id : null,
    dept_id !== undefined ? dept_id : null,
    is_active !== undefined ? is_active : null,
    user.id
  );

  const updated = db.prepare(`SELECT id, email, name, role, dept_id, is_active, created_at, last_login FROM users WHERE id = ?`).get(user.id);
  audit(req, 'update', 'user', user.id, user, updated);
  res.json({ ok: true });
});

// DELETE /api/users/:id  — физическое удаление (admin only, нельзя себя)
router.delete('/:id', requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  if (req.user?.sub === id) return res.status(400).json({ error: 'Нельзя удалить себя' });

  const user = db.prepare(`SELECT id, email, name, role, dept_id, is_active, created_at, last_login FROM users WHERE id = ?`).get(id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  audit(req, 'delete', 'user', id, user, null);
  res.json({ ok: true });
});

// POST /api/users/:id/reset-password  — сброс пароля (admin)
router.post('/:id/reset-password', requireRole('admin'), (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Пароль min 8 символов' });
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 10), user.id);
  audit(req, 'reset_password', 'user', user.id);
  res.json({ ok: true });
});

module.exports = router;
