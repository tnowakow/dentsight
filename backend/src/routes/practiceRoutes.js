const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', practiceController.getPractices);
router.get('/:id', practiceController.getPractice);
router.put('/:id', practiceController.updatePractice);

module.exports = router;
