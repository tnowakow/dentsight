const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const authMiddleware = require('../middleware/authMiddleware');

const publicOrAuth = (req, res, next) => {
  if (req.query.company_id) return next();
  return authMiddleware(req, res, next);
};

router.get('/', publicOrAuth, metricsController.getMetrics);
router.get('/:metric_name/trend', publicOrAuth, metricsController.getMetricTrend);

module.exports = router;
