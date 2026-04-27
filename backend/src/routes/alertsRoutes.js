const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', alertsController.getAlerts);
router.post('/:id/resolve', alertsController.resolveAlert);

module.exports = router;
