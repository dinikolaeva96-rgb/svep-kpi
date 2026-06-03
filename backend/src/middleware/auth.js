'use strict';

const jwt = require('jsonwebtoken');

const ROLE_LEVELS = { public: 0, dept_head: 1, management: 2, admin: 3 };

/**
 * Attach user from JWT to req.user (optional — does NOT block).
 */
function attachUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // invalid token — treated as anonymous
  }
  next();
}

/**
 * Require a minimum role level.
 * Usage: router.get('/secret', requireRole('management'), handler)
 */
function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }
    const userLevel = ROLE_LEVELS[req.user.role] ?? -1;
    const minLevel  = ROLE_LEVELS[minRole]       ?? 99;
    if (userLevel < minLevel) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
}

module.exports = { attachUser, requireRole };
