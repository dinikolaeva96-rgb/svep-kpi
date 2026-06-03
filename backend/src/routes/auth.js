'use strict';

const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const db      = require('../db');

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, dept_id: user.dept_id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function signRefresh(user) {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email и password обязательны' });

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  const accessToken  = signAccess(user);
  const refreshToken = signRefresh(user);
  const tokenHash    = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt    = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)').run(user.id, tokenHash, expiresAt);
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  res.json({ accessToken, refreshToken, role: user.role, name: user.name });
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken обязателен' });

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' });
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const stored    = db.prepare("SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > datetime('now')").get(tokenHash);
  if (!stored) return res.status(401).json({ error: 'Токен отозван или истёк' });

  const user = db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').get(payload.sub);
  if (!user) return res.status(401).json({ error: 'Пользователь не найден' });

  const newAccess = signAccess(user);
  res.json({ accessToken: newAccess });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    db.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?').run(tokenHash);
  }
  res.json({ ok: true });
});

// POST /api/auth/change-password
router.post('/change-password', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Поля обязательны' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Минимум 8 символов' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Неверный текущий пароль' });
  }

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 10), user.id);
  res.json({ ok: true });
});

module.exports = router;
