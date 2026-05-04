const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAlerts = async (req, res) => {
  try {
    const { practice_id, resolved, company_id } = req.query;
    const isResolved = resolved === 'true' ? true : resolved === 'false' ? false : undefined; // Typo in my head

    // Let's use a more robust approach for the check
    let whereClause = {};
    
    // Filter by company_id if provided
    if (company_id) {
      whereClause.practiceId = {
        in: await prisma.practice.findMany({
          where: { companyId: company_id },
          select: { id: true }
        }).then(practices => practices.map(p => p.id))
      };
    } else if (practice_id) {
      whereClause.practiceId = practice_id;
    }
    
    if (resolved === 'true') whereClause.isResolved = true;
    else if (resolved === 'false') whereClause.isResolved = false;

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get Alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.alert.update({
      where: { id: id },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Resolve Alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};