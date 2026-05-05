const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAlerts = async (req, res) => {
  try {
    const { practice_id, resolved, company_id } = req.query;

    let whereClause = {};
    
    if (company_id) {
      const practices = await prisma.practice.findMany({
        where: { companyId: company_id },
        select: { id: true }
      });
      whereClause.practiceId = { in: practices.map(p => p.id) };
    } else if (practice_id) {
      whereClause.practiceId = practice_id;
    }
    
    if (resolved === 'true') whereClause.isResolved = true;
    else if (resolved === 'false') whereClause.isResolved = false;

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }]
    });

    // Transform to frontend-expected format
    const transformed = alerts.map(alert => ({
      id: alert.id,
      practiceId: alert.practiceId,
      metricName: alert.metricName,
      type: alert.alertType,
      severity: alert.severity,
      headline: generateHeadline(alert.metricName, alert.severity),
      subtext: alert.message,
      isResolved: alert.isResolved,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Get Alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function generateHeadline(metricName, severity) {
  const severityPrefix = severity >= 2 ? '⚠️ ' : severity >= 1 ? '📊 ' : '✅ ';
  const headlines = {
    'denial_rate': 'High Claim Denial Rate',
    'net_collection_rate': 'Collection Rate Below Target',
    'case_acceptance_rate': 'Case Acceptance Needs Improvement',
    'new_patients': 'New Patient Volume Update',
    'hygiene_production': 'Hygiene Production Alert',
    'no_show_rate': 'No-Show Rate Elevated',
    'cost_per_chair_hour': 'Chair Hour Costs High'
  };
  return severityPrefix + (headlines[metricName] || `${metricName} Alert`);
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