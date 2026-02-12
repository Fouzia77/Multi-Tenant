DO $$ BEGIN
    CREATE TYPE "enum_tasks_status" AS ENUM ('todo', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "enum_tasks_status" DEFAULT 'todo',
    "priority" VARCHAR(20) DEFAULT 'medium',
    "projectId" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "tenantId" UUID NOT NULL REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "assignedTo" UUID NULL REFERENCES "users" ("id") ON DELETE SET NULL,
    "dueDate" DATE NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on (tenantId, projectId) for better multi-tenant performance
CREATE INDEX IF NOT EXISTS "tasks_tenantId_projectId_idx" ON "tasks" ("tenantId", "projectId");