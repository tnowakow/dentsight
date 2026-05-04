import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

const createHash = (name: string) => crypto.createHash('sha256').update(name).digest('hex').substring(0, 16)

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

// Reduced patient counts to keep seed fast over remote connection
const scenarios = [
  { name: "High Growth Dental",       isAcquisitionTarget: true,  annualRevenue: 1800000, patientCount: 300, practices: 1, growth: 0.25, recare: 0.93, collection: 0.98, denial: 0.03, costPerHour: 180, alerts: [{ metric: 'new_patients', severity: 0, msg: 'New patient numbers trending 25% above target!' }] },
  { name: "Stable Smiles Clinic",     isAcquisitionTarget: false, annualRevenue: 1200000, patientCount: 280, practices: 1, growth: 0.05, recare: 0.88, collection: 0.99, denial: 0.02, costPerHour: 150, alerts: [] },
  { name: "Sunset Dental Group",      isAcquisitionTarget: true,  annualRevenue: 700000,  patientCount: 200, practices: 1, growth: -0.10, recare: 0.75, collection: 0.92, denial: 0.08, costPerHour: 200, alerts: [{ metric: 'hygiene_production', severity: 2, msg: 'Hygiene production is 15% below target for 3 consecutive months.' }] },
  { name: "Innovate Dental Start",    isAcquisitionTarget: false, annualRevenue: 600000,  patientCount: 150, practices: 1, growth: 0.50, recare: 0.70, collection: 0.90, denial: 0.10, costPerHour: 220, alerts: [{ metric: 'net_collection_rate', severity: 2, msg: 'Collection rate below 90% for Q2.' }] },
  { name: "Pinnacle Dental Partners", isAcquisitionTarget: true,  annualRevenue: 4500000, patientCount: 600, practices: 3, growth: 0.12, recare: 0.90, collection: 0.97, denial: 0.04, costPerHour: 160, alerts: [] },
  { name: "Dr. Eva's Elite Dentistry",isAcquisitionTarget: true,  annualRevenue: 1100000, patientCount: 220, practices: 1, growth: 0.07, recare: 0.92, collection: 0.99, denial: 0.02, costPerHour: 140, alerts: [] },
  { name: "Restore Dental Wellness",  isAcquisitionTarget: true,  annualRevenue: 950000,  patientCount: 250, practices: 1, growth: 0,    recare: 0.80, collection: 0.95, denial: 0.06, costPerHour: 170, alerts: [{ metric: 'case_acceptance_rate', severity: 1, msg: 'Case acceptance rate has been stagnant for 6 months.' }] },
  { name: "Digital Dental Dynamics",  isAcquisitionTarget: true,  annualRevenue: 1600000, patientCount: 280, practices: 1, growth: 0.18, recare: 0.95, collection: 0.98, denial: 0.03, costPerHour: 155, alerts: [] },
  { name: "Generations Dental Care",  isAcquisitionTarget: true,  annualRevenue: 800000,  patientCount: 240, practices: 1, growth: 0.01, recare: 0.78, collection: 0.94, denial: 0.07, costPerHour: 190, alerts: [{ metric: 'denial_rate', severity: 1, msg: 'Denial rate from MetLife claims is unusually high.' }] },
  { name: "Heartland Community Dental",isAcquisitionTarget: true, annualRevenue: 850000,  patientCount: 180, practices: 1, growth: 0.03, recare: 0.85, collection: 0.96, denial: 0.05, costPerHour: 165, alerts: [] },
]

async function main() {
  console.log('🌱 Clearing existing data...')
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE alerts, metrics, expenses, procedures, appointments, patients, practices, "Company" RESTART IDENTITY CASCADE
  `)
  console.log('🗑️  Database cleared.')

  for (const scenario of scenarios) {
    const company = await prisma.company.create({
      data: { name: scenario.name, isAcquisitionTarget: scenario.isAcquisitionTarget },
    })

    const practiceCount = scenario.practices || 1

    for (let i = 0; i < practiceCount; i++) {
      const practiceName = practiceCount > 1 ? `${scenario.name} — Location ${i + 1}` : scenario.name
      const practice = await prisma.practice.create({
        data: {
          name: practiceName,
          practiceHash: createHash(practiceName + i),
          ownerName: 'Dr. Placeholder',
          locationCity: 'Virtual City',
          locationState: 'MI',
          companyId: company.id,
        },
      })

      const perPracticePatients = Math.floor(scenario.patientCount / practiceCount)
      const perPracticeRevenue  = scenario.annualRevenue / practiceCount

      // --- Patients (batch) ---
      const patientRows = Array.from({ length: perPracticePatients }, (_, j) => ({
        practiceId: practice.id,
        patientHash: createHash(`${practice.id}-p${j}`),
        ageBucket: AGE_BUCKETS[j % AGE_BUCKETS.length],
        gender: j % 2 === 0 ? 'M' : 'F',
        insuranceType: INSURANCE_TYPES[j % INSURANCE_TYPES.length],
      }))
      await prisma.patient.createMany({ data: patientRows })

      // --- Appointments (batch) ---
      const apptCount = perPracticePatients * 2
      const avgProduction = perPracticeRevenue / apptCount
      const now = Date.now()
      const apptRows = Array.from({ length: apptCount }, (_, k) => ({
        time: new Date(now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
        practiceId: practice.id,
        patientHash: patientRows[k % patientRows.length].patientHash,
        appointmentType: k % 3 === 0 ? 'Cleaning' : 'Treatment',
        providerId: `DR-${(k % 3) + 1}`,
        status: ['Completed', 'Scheduled', 'Cancelled'][k % 3],
        productionValue: avgProduction * (0.8 + Math.random() * 0.4),
      }))
      // Insert in chunks of 500 to avoid payload limits
      for (let c = 0; c < apptRows.length; c += 500) {
        await prisma.appointment.createMany({ data: apptRows.slice(c, c + 500) })
      }

      // --- Procedures (batch, ~50% of appts) ---
      const procRows = apptRows
        .filter((_, k) => k % 2 === 0)
        .map((appt, k) => {
          const proc = PROCEDURE_CODES[k % PROCEDURE_CODES.length]
          return {
            time: appt.time,
            practiceId: practice.id,
            patientHash: appt.patientHash,
            procedureCode: proc.code,
            procedureName: proc.name,
            productionValue: proc.value,
            renderedBy: appt.providerId,
            status: 'Completed',
          }
        })
      for (let c = 0; c < procRows.length; c += 500) {
        await prisma.procedure.createMany({ data: procRows.slice(c, c + 500) })
      }

      // --- Metrics (batch) ---
      const metricRows = [
        { name: 'hygiene_recare_rate',   value: scenario.recare * 100,      unit: '%' },
        { name: 'net_collection_rate',   value: scenario.collection * 100,  unit: '%' },
        { name: 'denial_rate',           value: scenario.denial * 100,      unit: '%' },
        { name: 'cost_per_chair_hour',   value: scenario.costPerHour,       unit: '$' },
        { name: 'case_acceptance_rate',  value: 68 + Math.random() * 12,    unit: '%' },
        { name: 'new_patient_count',     value: Math.floor(perPracticePatients * scenario.growth * 10), unit: 'count' },
      ].map(m => ({
        practiceId:        practice.id,
        metricDate:        new Date(),
        metricName:        m.name,
        metricValue:       m.value * (0.98 + Math.random() * 0.04),
        targetValue:       m.value,
        industryBenchmark: m.value * 0.95,
        unit:              m.unit,
      }))
      await prisma.metric.createMany({ data: metricRows })

      // --- Alerts (batch) ---
      if (scenario.alerts.length > 0) {
        await prisma.alert.createMany({
          data: scenario.alerts.map(a => ({
            practiceId:  practice.id,
            metricName:  a.metric,
            alertType:   'below_target',
            message:     a.msg,
            severity:    a.severity,
            isResolved:  false,
          })),
        })
      }
    }

    console.log(`✅  ${scenario.name} (${practiceCount} practice(s))`)
  }

  console.log('\n✨ Seeding complete!')
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
