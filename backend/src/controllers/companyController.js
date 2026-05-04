const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        practices: true // Include associated practices for context
      }
    });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        practices: true // Include associated practices for context
      }
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};