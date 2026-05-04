const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

// Get overview data for a practice or company
router.get('/overview', kpiController.getOverviewData);
router.get('/company-overview', kpiController.getCompanyOverview);

module.exports = router;
