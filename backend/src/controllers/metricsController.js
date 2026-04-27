const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMetrics = async (req, res) => {
  try {
    const { practice_id, from, to } = req.query;
    
    const where = {
      practiceId: practice_id,
      metricDate: {
        gte: from ? new Date(from) : new Date(0),
        lte: to ? new Date(to) : new Date()
      }
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
    const { practice_id, months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const metrics = await prisma.metric.findMany({
      where: {
        practiceId: practice_id,
        metricName: metric_name,
        metricDate: { gte: startDate }
      },
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
