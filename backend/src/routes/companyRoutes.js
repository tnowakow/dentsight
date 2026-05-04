const express = require('express');
const router = express.Router();
const { getAllCompanies, getCompanyById } = require('../controllers/companyController');

// Get all companies
router.get('/', getAllCompanies);

// Get company by ID
router.get('/:id', getCompanyById);

module.exports = router;