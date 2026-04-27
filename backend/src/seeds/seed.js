const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.expense.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.practice.deleteMany();

  // Create a practice
  const practice = await prisma.practice.create({
    data: {
      name: 'Test Dental Practice',
      practiceHash: 'test-hash-123',
      ownerName: 'Test Owner',
      locationCity: 'San Francisco',
      locationState: 'CA',
      subscriptionTier: 'founding'
    }
  });

  console.log('Created practice:', practice.id);

  // Create some metrics
  await prisma.metric.create({
    data: {
      practiceId: practice.id,
      metricDate: new Date(),
      metricName: 'hygiene_recare_rate',
      metricValue: 82.5,
      targetValue: 85.0,
      industryBenchmark: 80.0,
      unit: '%'
    }
  });

  await prisma.metric.create({
    data: {
      practiceId: practice.id,
      metricDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      metricName: 'hygiene_recare_rate',
      metricValue: 78.0,
      targetValue: 85.0,
      industryBenchmark: 80.0,
      unit: '%'
    }
  });

  // Create an alert
  await prisma.alert.create({
    data: {
      practiceId: practice.id,
      metricName: 'hygiene_recare_rate',
      alertType: 'warning',
      message: 'Hygiene re-care rate dropped to 78% (target: 85%)',
      severity: 2
    }
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
