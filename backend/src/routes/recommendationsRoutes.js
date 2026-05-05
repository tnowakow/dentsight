const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');

// GET /api/recommendations?practice_id=... OR ?company_id=...
router.get('/', recommendationsController.getRecommendations);

module.exports = router;
