const express = require('express');
const router = express.Router();
const valuationController = require('../controllers/valuationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', valuationController.getValuation);

module.exports = router;
