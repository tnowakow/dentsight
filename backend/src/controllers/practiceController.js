const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPractice = async (req, res) => {
  try {
    const { id } = req.params;
    const practice = await prisma.practice.findUnique({
      where: { id: id },
      include: {
        // We could include other things if needed, but keeping it simple for now
      }
    });

    if (!practice) {
      return res.status(404).json({ error: 'Practice not found' });
    }

    res.json(practice);
  } catch (error) {
    console.error('Get Practice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePractice = async (req, res) => {
  try {
    const { id } = req.params;
    const { target_values } = req.body;

    // This is a simplification of the task requirement for updating practice targets
    // In a real app, we would iterate through target_values and update the 'metrics' table
    if (target_values && Array.isArray(target_values)) {
      for (const target of target_values) {
        await prisma.metric.upsert({
          where: {
            practiceId_metricDate_metricName: {
              practiceId: id,
              metricDate: new Date(), // For simplicity, we'll just use today for this demo/task
              metricName: target.metric_name
            }
          },
          update: {
            targetValue: target.target_value
          },
          create: {
            practiceId: id,
            metricDate: new Date(),
            metricName: target.metric_name,
            metricValue: 0, // Placeholder
            targetValue: target.target_value
          }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update Practice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New function to get practices with optional company_id filtering
exports.getPractices = async (req, res) => {
  try {
    const { company_id } = req.query;
    
    let where = {};
    
    // Filter by company_id if provided
    if (company_id) {
      where.companyId = company_id;
    }

    const practices = await prisma.practice.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(practices);
  } catch (error) {
    console.error('Get Practices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};