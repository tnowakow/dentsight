const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', metricsController.getMetrics);
router.get('/:metric_name/trend', metricsController.getMetricTrend);

module.exports = router;
