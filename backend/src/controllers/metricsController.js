const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMetrics = async (req, res) => {
  try {
    const { practice_id, from, to, company_id } = req.query;
    
    let where = {};
    
    // Filter by company_id if provided
    if (company_id) {
      where.practiceId = {
        in: await prisma.practice.findMany({
          where: { companyId: company_id },
          select: { id: true }
        }).then(practices => practices.map(p => p.id))
      };
    } else if (practice_id) {
      where.practiceId = practice_id;
    }
    
    // Apply date range filter
    where.metricDate = {
      gte: from ? new Date(from) : new Date(0),
      lte: to ? new Date(to) : new Date()
    };

    const metrics = await prisma.metric.findMany({
      where,
      orderBy: { metricDate: 'desc' }
    });

    res.json(metrics);
  } catch (error) {
    console.error('Get Metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMetricTrend = async (req, res) => {
  try {
    const { metric_name } = req.params;
    const { practice_id, months = 12, company_id } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    let where = {
      metricName: metric_name,
      metricDate: { gte: startDate }
    };
    
    // Filter by company_id if provided
    if (company_id) {
      where.practiceId = {
        in: await prisma.practice.findMany({
          where: { companyId: company_id },
          select: { id: true }
        }).then(practices => practices.map(p => p.id))
      };
    } else if (practice_id) {
      where.practiceId = practice_id;
    }

    const metrics = await prisma.metric.findMany({
      where,
      orderBy: { metricDate: 'asc' },
      select: {
        metricDate: true,
        metricValue: true
      }
    });

    res.json(metrics);
  } catch (error) {
    console.error('Get Metric Trend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};