const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');
const authMiddleware = require('../middleware/authMiddleware');

const publicOrAuth = (req, res, next) => {
  if (req.query.company_id) return next();
  return authMiddleware(req, res, next);
};

router.get('/', publicOrAuth, alertsController.getAlerts);
router.post('/:id/resolve', authMiddleware, alertsController.resolveAlert);

module.exports = router;
