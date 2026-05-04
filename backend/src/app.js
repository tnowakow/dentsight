const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const valuationRoutes = require('./routes/valuationRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const companyRoutes = require('./routes/companyRoutes');
const kpiRoutes = require('./routes/kpiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files from /public directory (built by Vite)
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // Let API routes handle it (will 404 if not found)
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/kpi', kpiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
