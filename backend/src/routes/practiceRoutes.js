const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const authMiddleware = require('../middleware/authMiddleware');

const publicOrAuth = (req, res, next) => {
  if (req.query.company_id) return next();
  return authMiddleware(req, res, next);
};

router.get('/', publicOrAuth, practiceController.getPractices);
router.get('/:id', authMiddleware, practiceController.getPractice);
router.put('/:id', practiceController.updatePractice);

module.exports = router;
