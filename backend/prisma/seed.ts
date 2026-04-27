import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Helper to create practice hash
const createHash = (name: string) => crypto.createHash('sha256').update(name).digest('hex')

// Dental procedure codes with typical production values
const PROCEDURE_CODES = [
  { code: 'D0120', name: 'Periodic Oral Evaluation', value: 89 },
  { code: 'D0274', name: 'Complete Series Periapical X-rays', value: 185 },
  { code: 'D1110', name: 'Prophylaxis - Adult', value: 135 },
  { code: 'D2391', name: 'Porcelain Veneer', value: 1250 },
  { code: 'D2740', name: 'Porcelain Crown', value: 1850 },
  { code: 'D2950', name: 'Prefabricated Crown', value: 650 },
  { code: 'D3330', name: 'Vital Pulp Therapy', value: 475 },
  { code: 'D3340', name: 'Pulpectomy - Primary Tooth', value: 525 },
  { code: 'D9110', name: 'Emergency Visit', value: 125 },
  { code: 'D7140', name: 'Surgical Removal of Tooth', value: 385 },
]

// Age buckets for patients
const AGE_BUCKETS = ['0-17', '18-34', '35-49', '50-64', '65+']

// Insurance types
const INSURANCE_TYPES = ['Delta Dental', 'Cigna', 'Aetna', 'MetLife', 'Guardian', 'Uninsured', 'Medicare']

async function main() {
  console.log('🌱 Seeding Dentsight database...')

  // Create a demo practice
  const practiceName = 'Bright Smile Dental'
  const practiceHash = createHash(practiceName)
  
  const practice = await prisma.practice.create({
    data: {
      name: practiceName,
      practiceHash,
      ownerName: 'Dr. Sarah Mitchell',
      locationCity: 'Ann Arbor',
      locationState: 'MI',
      subscriptionTier: 'founding',
    },
  })

  console.log(`✅ Created practice: ${practice.name}`)

  // Create patients (50 patients)
  const patients = []
  for (let i = 1; i <= 50; i++) {
    const patientHash = createHash(`${practiceHash}-patient-${i}`)
    const patient = await prisma.patient.create({
      data: {
        practiceId: practice.id,
        patientHash,
        ageBucket: AGE_BUCKETS[Math.floor(Math.random() * AGE_BUCKETS.length)],
        gender: Math.random() > 0.5 ? 'M' : 'F',
        insuranceType: INSURANCE_TYPES[Math.floor(Math.random() * INSURANCE_TYPES.length)],
      },
    })
    patients.push(patient)
  }
  console.log(`✅ Created ${patients.length} patients`)

  // Create appointments and procedures for the last 90 days
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  
  let appointmentCount = 0
  let procedureCount = 0

  for (let i = 0; i < 300; i++) {
    // Random date in the last 90 days
    const randomDate = new Date(ninetyDaysAgo.getTime() + Math.random() * (now.getTime() - ninetyDaysAgo.getTime()))
    
    // Pick a random patient
    const patient = patients[Math.floor(Math.random() * patients.length)]
    
    // Create appointment
    await prisma.appointment.create({
      data: {
        time: randomDate,
        practiceId: practice.id,
        patientHash: patient.patientHash,
        appointmentType: Math.random() > 0.3 ? 'Treatment' : 'Cleaning',
        providerId: `DR-${Math.floor(Math.random() * 3) + 1}`,
        status: ['Completed', 'Scheduled', 'Cancelled'][Math.floor(Math.random() * 3)],
        productionValue: Math.random() > 0.2 ? (Math.random() * 500 + 100).toFixed(2) : null,
        procedureCodes: [PROCEDURE_CODES[Math.floor(Math.random() * PROCEDURE_CODES.length)].code],
      },
    })
    appointmentCount++

    // Create associated procedure (70% of appointments have procedures)
    if (Math.random() > 0.3) {
      const proc = PROCEDURE_CODES[Math.floor(Math.random() * PROCEDURE_CODES.length)]
      await prisma.procedure.create({
        data: {
          time: randomDate,
          practiceId: practice.id,
          patientHash: patient.patientHash,
          procedureCode: proc.code,
          procedureName: proc.name,
          productionValue: proc.value + (Math.random() * 200 - 100), // ±$100 variance
          renderedBy: `DR-${Math.floor(Math.random() * 3) + 1}`,
          status: 'Completed',
        },
      })
      procedureCount++
    }
  }

  console.log(`✅ Created ${appointmentCount} appointments and ${procedureCount} procedures`)

  // Create metrics for the last 90 days (daily snapshots)
  const metricNames = [
    { name: 'production_per_provider', target: 15000, benchmark: 12000, unit: '$' },
    { name: 'new_patients', target: 8, benchmark: 6, unit: 'count' },
    { name: 'hygiene_production', target: 4500, benchmark: 3800, unit: '$' },
    { name: 'case_acceptance_rate', target: 72, benchmark: 65, unit: '%' },
    { name: 'average_production_per_patient', target: 1850, benchmark: 1600, unit: '$' },
  ]

  let metricCount = 0
  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const metricDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    for (const metric of metricNames) {
      // Add some realistic variance and trends
      const variance = (Math.random() * 0.3 - 0.15) // ±15% variance
      const trend = daysAgo > 60 ? 1.05 : (daysAgo > 30 ? 1.02 : 1) // Slight upward trend
      
      await prisma.metric.create({
        data: {
          practiceId: practice.id,
          metricDate,
          metricName: metric.name,
          metricValue: (metric.benchmark * (1 + variance) * trend).toFixed(4),
          targetValue: metric.target,
          industryBenchmark: metric.benchmark,
          unit: metric.unit,
        },
      })
      metricCount++
    }
  }

  console.log(`✅ Created ${metricCount} metric records`)

  // Create some alerts
  const alerts = [
    {
      metricName: 'case_acceptance_rate',
      alertType: 'below_target',
      message: 'Case acceptance rate has dropped below 65% for the past week',
      severity: 2,
      isResolved: false,
    },
    {
      metricName: 'new_patients',
      alertType: 'below_benchmark',
      message: 'New patient count is trending below industry benchmark',
      severity: 1,
      isResolved: true,
      resolvedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      metricName: 'production_per_provider',
      alertType: 'above_target',
      message: 'Production per provider exceeded $18,000 this week!',
      severity: 0, // Info level
      isResolved: false,
    },
  ]

  for (const alert of alerts) {
    await prisma.alert.create({
      data: {
        practiceId: practice.id,
        ...alert,
      },
    })
  }

  console.log(`✅ Created ${alerts.length} alerts`)

  // Create expenses for the last 90 days
  const expenseCategories = [
    { category: 'Labor', subcategories: ['Dentist Salary', 'Hygienist Salary', 'Front Desk', 'Assistant'] },
    { category: 'Supplies', subcategories: ['Clinical Supplies', 'Lab Fees', 'Office Supplies'] },
    { category: 'Facility', subcategories: ['Rent', 'Utilities', 'Maintenance'] },
    { category: 'Marketing', subcategories: ['Digital Ads', 'Print Media', 'Referral Programs'] },
  ]

  let expenseCount = 0
  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const expenseDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    // Create 3-7 expenses per day
    const dailyExpenseCount = Math.floor(Math.random() * 5) + 3
    
    for (let i = 0; i < dailyExpenseCount; i++) {
      const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
      const subcat = cat.subcategories[Math.floor(Math.random() * cat.subcategories.length)]
      
      // Base amounts by category with variance
      let baseAmount: number
      switch (cat.category) {
        case 'Labor': baseAmount = 800 + Math.random() * 400; break
        case 'Supplies': baseAmount = 150 + Math.random() * 350; break
        case 'Facility': baseAmount = 200 + Math.random() * 300; break
        case 'Marketing': baseAmount = 100 + Math.random() * 200; break
        default: baseAmount = 100
      }

      await prisma.expense.create({
        data: {
          practiceId: practice.id,
          expenseDate,
          category: cat.category,
          subcategory: subcat,
          amount: baseAmount.toFixed(2),
          isAddback: false,
        },
      })
      expenseCount++
    }
  }

  console.log(`✅ Created ${expenseCount} expense records`)

  // Summary
  console.log('\n📊 Seed Summary:')
  console.log(`   Practice: ${practice.name}`)
  console.log(`   Patients: ${patients.length}`)
  console.log(`   Appointments: ${appointmentCount}`)
  console.log(`   Procedures: ${procedureCount}`)
  console.log(`   Metrics: ${metricCount} (90 days)` )
  console.log(`   Expenses: ${expenseCount}`)
  console.log(`   Alerts: ${alerts.length}`)
  console.log('\n✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
