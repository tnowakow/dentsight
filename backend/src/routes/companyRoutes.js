const express = require('express');
const router = express.Router();
const { getAllCompanies, getCompanyById } = require('../controllers/companyController');

// Get all companies
router.get('/api/companies', getAllCompanies);

// Get company by ID
router.get('/api/companies/:id', getCompanyById);

module.exports = router;