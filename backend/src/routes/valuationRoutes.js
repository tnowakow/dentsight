const express = require('express');
const router = express.Router();
const valuationController = require('../controllers/valuationController');
const authMiddleware = require('../middleware/authMiddleware');

// Public when company_id query param is provided (demo mode)
// Auth required for practice-specific access
router.get('/', (req, res, next) => {
  if (req.query.company_id) return next();
  return authMiddleware(req, res, next);
}, valuationController.getValuation);

module.exports = router;
