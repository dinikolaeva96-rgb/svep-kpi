'use strict';

const db = require('../db');

const insertLog = db.prepare(`
  INSERT INTO audit_log (user_id, user_name, action, entity, entity_id, old_value, new_value, ip)
  VALUES (@user_id, @user_name, @action, @entity, @entity_id, @old_value, @new_value, @ip)
`);

/**
 * Записать событие аудита.
 * @param {object} req  — Express request (для user и ip)
 * @param {string} action  — 'create' | 'update' | 'delete' | 'login' | ...
 * @param {string} entity  — 'user' | 'indicator' | 'kpi_value' | 'kaizen' | ...
 * @param {number|null} entityId
 * @param {any} oldValue
 * @param {any} newValue
 */
function audit(req, action, entity, entityId = null, oldValue = null, newValue = null) {
  try {
    insertLog.run({
      user_id:   req.user?.sub   ?? null,
      user_name: req.user?.name  ?? 'anonymous',
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue  != null ? JSON.stringify(oldValue)  : null,
      new_value: newValue  != null ? JSON.stringify(newValue)  : null,
      ip: req.ip ?? null,
    });
  } catch (e) {
    // Аудит не должен ломать основной поток
    console.error('audit error:', e.message);
  }
}

module.exports = { audit };
