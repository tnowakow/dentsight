const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const valuationRoutes = require('./routes/valuationRoutes');
const practiceRoutes = require('./routes/practiceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/practice', practiceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
