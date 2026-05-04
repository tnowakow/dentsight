-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAcquisitionTarget" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "practice_hash" VARCHAR(64) NOT NULL,
    "owner_name" VARCHAR(255),
    "location_city" VARCHAR(100),
    "location_state" VARCHAR(50),
    "subscription_tier" VARCHAR(50) DEFAULT 'founding',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "practices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "practice_id" UUID NOT NULL,
    "patient_hash" VARCHAR(64) NOT NULL,
    "age_bucket" VARCHAR(20),
    "gender" VARCHAR(10),
    "insurance_type" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "time" TIMESTAMPTZ NOT NULL,
    "practice_id" UUID NOT NULL,
    "patient_hash" VARCHAR(64) NOT NULL,
    "appointment_type" VARCHAR(50),
    "provider_id" VARCHAR(100),
    "status" VARCHAR(50),
    "production_value" DECIMAL(12,2),
    "procedure_codes" TEXT[],

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("time","practice_id","patient_hash")
);

-- CreateTable
CREATE TABLE "procedures" (
    "time" TIMESTAMPTZ NOT NULL,
    "practice_id" UUID NOT NULL,
    "patient_hash" VARCHAR(64) NOT NULL,
    "procedure_code" VARCHAR(20) NOT NULL,
    "procedure_name" VARCHAR(255),
    "production_value" DECIMAL(12,2) NOT NULL,
    "rendered_by" VARCHAR(100),
    "status" VARCHAR(50),

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("time","practice_id","patient_hash","procedure_code")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "practice_id" UUID NOT NULL,
    "metric_date" DATE NOT NULL,
    "metric_name" VARCHAR(100) NOT NULL,
    "metric_value" DECIMAL(12,4) NOT NULL,
    "target_value" DECIMAL(12,4),
    "industry_benchmark" DECIMAL(12,4),
    "unit" VARCHAR(50),

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "practice_id" UUID NOT NULL,
    "metric_name" VARCHAR(100) NOT NULL,
    "alert_type" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 2,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "practice_id" UUID NOT NULL,
    "expense_date" DATE NOT NULL,
    "category" VARCHAR(100),
    "subcategory" VARCHAR(100),
    "amount" DECIMAL(12,2) NOT NULL,
    "is_addback" BOOLEAN NOT NULL DEFAULT false,
    "addback_reason" VARCHAR(255),

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "practices_practice_hash_key" ON "practices"("practice_hash");

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_hash_key" ON "patients"("patient_hash");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_practice_id_metric_date_metric_name_key" ON "metrics"("practice_id", "metric_date", "metric_name");

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_hash_fkey" FOREIGN KEY ("patient_hash") REFERENCES "patients"("patient_hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_patient_hash_fkey" FOREIGN KEY ("patient_hash") REFERENCES "patients"("patient_hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
