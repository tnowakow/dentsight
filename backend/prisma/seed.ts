
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Helper to create a unique hash
const createHash = (name: string) => crypto.createHash('sha256').update(name).digest('hex')

// Dental procedure codes with typical production values
const PROCEDURE_CODES = [
  { code: 'D0120', name: 'Periodic Oral Evaluation', value: 89 },
  { code: 'D0274', name: 'Complete Series Periapical X-rays', value: 185 },
  { code: 'D1110', name: 'Prophylaxis - Adult', value: 135 },
  { code: 'D2391', name: 'Composite-Resin Filling', value: 250 },
  { code: 'D2740', name: 'Porcelain Crown', value: 1850 },
  { code: 'D2950', name: 'Core Buildup', value: 350 },
  { code: 'D3310', name: 'Root Canal - Anterior', value: 950 },
  { code: 'D7140', name: 'Surgical Removal of Tooth', value: 385 },
  { code: 'D4341', name: 'Periodontal Scaling and Root Planing', value: 275 },
  { code: 'D9940', name: 'Occlusal Guard', value: 600 },
]

const AGE_BUCKETS = ['0-17', '18-34', '35-49', '50-64', '65+']
const INSURANCE_TYPES = ['Delta Dental', 'Cigna', 'Aetna', 'MetLife', 'Guardian', 'Uninsured', 'Medicare']

const scenarios = [
    { name: "High Growth Dental", isAcquisitionTarget: true, annualRevenue: 1800000, patientCount: 2200, growth: 0.25, recare: 0.93, collection: 0.98, denial: 0.03, costPerHour: 180, alerts: [{ metric: 'new_patients', severity: 0, msg: 'New patient numbers trending 25% above target!' }] },
    { name: "Stable Smiles Clinic", isAcquisitionTarget: false, annualRevenue: 1200000, patientCount: 2800, growth: 0.05, recare: 0.88, collection: 0.99, denial: 0.02, costPerHour: 150, alerts: [] },
    { name: "Sunset Dental Group", isAcquisitionTarget: true, annualRevenue: 700000, patientCount: 1500, growth: -0.10, recare: 0.75, collection: 0.92, denial: 0.08, costPerHour: 200, alerts: [{ metric: 'hygiene_production', severity: 2, msg: 'Hygiene production is 15% below target for 3 consecutive months.' }] },
    { name: "Innovate Dental Start", isAcquisitionTarget: false, annualRevenue: 600000, patientCount: 800, growth: 0.50, recare: 0.70, collection: 0.90, denial: 0.10, costPerHour: 220, alerts: [{ metric: 'net_collection_rate', severity: 2, msg: 'Collection rate below 90% for Q2.' }] },
    { name: "Pinnacle Dental Partners", isAcquisitionTarget: true, annualRevenue: 4500000, patientCount: 7500, practices: 3, growth: 0.12, recare: 0.90, collection: 0.97, denial: 0.04, costPerHour: 160, alerts: [] },
    { name: "Dr. Eva's Elite Dentistry", isAcquisitionTarget: true, annualRevenue: 1100000, patientCount: 1800, growth: 0.07, recare: 0.92, collection: 0.99, denial: 0.02, costPerHour: 140, alerts: [] },
    { name: "Restore Dental Wellness", isAcquisitionTarget: true, annualRevenue: 950000, patientCount: 2000, growth: 0, recare: 0.80, collection: 0.95, denial: 0.06, costPerHour: 170, alerts: [{ metric: 'case_acceptance_rate', severity: 1, msg: 'Case acceptance rate has been stagnant for 6 months.' }] },
    { name: "Digital Dental Dynamics", isAcquisitionTarget: true, annualRevenue: 1600000, patientCount: 2400, growth: 0.18, recare: 0.95, collection: 0.98, denial: 0.03, costPerHour: 155, alerts: [] },
    { name: "Generations Dental Care", isAcquisitionTarget: true, annualRevenue: 800000, patientCount: 2000, growth: 0.01, recare: 0.78, collection: 0.94, denial: 0.07, costPerHour: 190, alerts: [{ metric: 'denial_rate', severity: 1, msg: 'Denial rate from MetLife claims is unusually high.' }] },
    { name: "Heartland Community Dental", isAcquisitionTarget: true, annualRevenue: 850000, patientCount: 1200, growth: 0.03, recare: 0.85, collection: 0.96, denial: 0.05, costPerHour: 165, alerts: [] },
];

async function main() {
  console.log('🌱 Clearing existing data...');
  // Transaction to ensure all deletions succeed before continuing
  await prisma.$transaction([
    prisma.alert.deleteMany(),
    prisma.metric.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.procedure.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.practice.deleteMany(),
    prisma.company.deleteMany(),
  ]);
  console.log('🗑️ Database cleared.');

  console.log(`🌱 Seeding ${scenarios.length} company scenarios...`);

  for (const scenario of scenarios) {
    // 1. Create Company
    const company = await prisma.company.create({
      data: {
        name: scenario.name,
        isAcquisitionTarget: scenario.isAcquisitionTarget,
      },
    });

    const practiceCount = scenario.practices || 1;
    let totalAppointments = 0;
    let totalProcedures = 0;

    for (let i = 0; i < practiceCount; i++) {
        const practiceName = practiceCount > 1 ? `${scenario.name} - Location ${i + 1}` : scenario.name;
        const practiceHash = createHash(practiceName);
        const practicePatientCount = Math.floor(scenario.patientCount / practiceCount);
        const practiceRevenue = scenario.annualRevenue / practiceCount;
        
        // 2. Create Practice(s)
        const practice = await prisma.practice.create({
            data: {
                name: practiceName,
                practiceHash,
                ownerName: 'Dr. Placeholder',
                locationCity: 'Virtual City',
                locationState: 'MI',
                companyId: company.id,
            },
        });

        // 3. Create Patients
        const patients = [];
        for (let j = 0; j < practicePatientCount; j++) {
            const patientHash = createHash(`${practiceHash}-patient-${j}`);
            const patient = await prisma.patient.create({
                data: {
                    practiceId: practice.id,
                    patientHash,
                    ageBucket: AGE_BUCKETS[Math.floor(Math.random() * AGE_BUCKETS.length)],
                    gender: Math.random() > 0.5 ? 'M' : 'F',
                    insuranceType: INSURANCE_TYPES[Math.floor(Math.random() * INSURANCE_TYPES.length)],
                },
            });
            patients.push(patient);
        }

        // 4. Create Appointments & Procedures
        // Approximate 2 appointments per patient per year to hit revenue targets
        const appointmentsToCreate = practicePatientCount * 2;
        const targetProductionPerAppointment = practiceRevenue / appointmentsToCreate;

        for (let k = 0; k < appointmentsToCreate; k++) {
            const randomDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
            const patient = patients[k % patients.length];
            const productionValue = targetProductionPerAppointment * (0.8 + Math.random() * 0.4); // +/- 20% variance

            await prisma.appointment.create({
                data: {
                    time: randomDate,
                    practiceId: practice.id,
                    patientHash: patient.patientHash,
                    appointmentType: Math.random() > 0.3 ? 'Treatment' : 'Cleaning',
                    providerId: `DR-${Math.floor(Math.random() * 3) + 1}`,
                    status: ['Completed', 'Scheduled', 'Cancelled'][Math.floor(Math.random() * 3)],
                    productionValue,
                },
            });
            totalAppointments++;

            if (Math.random() > 0.5) { // 50% chance of a procedure
                const proc = PROCEDURE_CODES[Math.floor(Math.random() * PROCEDURE_CODES.length)];
                await prisma.procedure.create({
                    data: {
                        time: randomDate,
                        practiceId: practice.id,
                        patientHash: patient.patientHash,
                        procedureCode: proc.code,
                        procedureName: proc.name,
                        productionValue: proc.value,
                        renderedBy: `DR-${Math.floor(Math.random() * 3) + 1}`,
                        status: 'Completed',
                    },
                });
                totalProcedures++;
            }
        }

        // 5. Create Metrics
        const metricNames = [
            { name: 'hygiene_recare_rate', value: scenario.recare * 100, unit: '%' },
            { name: 'net_collection_rate', value: scenario.collection * 100, unit: '%' },
            { name: 'denial_rate', value: scenario.denial * 100, unit: '%' },
            { name: 'cost_per_chair_hour', value: scenario.costPerHour, unit: '$' },
        ];
        
        for (const metric of metricNames) {
            await prisma.metric.create({
                data: {
                    practiceId: practice.id,
                    metricDate: new Date(),
                    metricName: metric.name,
                    metricValue: metric.value * (0.98 + Math.random() * 0.04), // +/- 2% variance
                    targetValue: metric.value,
                    industryBenchmark: metric.value * 0.95,
                    unit: metric.unit,
                },
            });
        }
        
        // 6. Create Alerts
        for (const alertInfo of scenario.alerts) {
            await prisma.alert.create({
                data: {
                    practiceId: practice.id,
                    metricName: alertInfo.metric,
                    alertType: 'below_target',
                    message: alertInfo.msg,
                    severity: alertInfo.severity,
                    isResolved: false,
                },
            });
        }
    }
    console.log(`✅ Seeded Company: ${scenario.name} (${practiceCount} practice(s), ${totalAppointments} appointments, ${totalProcedures} procedures)`);
  }

  console.log('\n✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
