'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const { attachUser } = require('./middleware/auth');
const authRoutes       = require('./routes/auth');
const deptRoutes       = require('./routes/departments');
const kpiRoutes        = require('./routes/kpi');
const masterRoute      = require('./routes/master');
const kaizenRoutes     = require('./routes/kaizen');
const alertRoutes      = require('./routes/alerts');
const trendsRoutes     = require('./routes/trends');
const usersRoutes      = require('./routes/users');
const indicatorsRoutes = require('./routes/indicators');
const auditRoutes      = require('./routes/auditlog');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(attachUser);

app.use('/api/auth',        authRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/kpi',         kpiRoutes);
app.use('/api/master',      masterRoute);
app.use('/api/kaizen',      kaizenRoutes);
app.use('/api/alerts',      alertRoutes);
app.use('/api/trends',      trendsRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/indicators',  indicatorsRoutes);
app.use('/api/audit',       auditRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

const db = require('./db');
app.get('/api/domains', (_, res) => {
  res.json(db.prepare('SELECT * FROM domains ORDER BY sort_order').all());
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => console.log(`🚀  Backend запущен на порту ${PORT}`));
