CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE "enum_payments_status" AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_payments_paymentMethod" AS ENUM ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    "status" "enum_payments_status" DEFAULT 'pending',
    "paymentMethod" "enum_payments_paymentMethod" NOT NULL,
    "description" TEXT,
    "transactionId" VARCHAR(255) UNIQUE,
    "referenceNumber" VARCHAR(255),
    "payerName" VARCHAR(255),
    "payerEmail" VARCHAR(255),
    "payerPhone" VARCHAR(50),
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "idx_payments_tenantId" ON "payments"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_payments_userId" ON "payments"("userId");
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "idx_payments_transactionId" ON "payments"("transactionId");
CREATE INDEX IF NOT EXISTS "idx_payments_createdAt" ON "payments"("createdAt");

