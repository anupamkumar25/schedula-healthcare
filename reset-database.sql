-- NUCLEAR OPTION: Complete database reset
-- This will DROP all tables and recreate them from scratch
-- WARNING: This will permanently delete ALL data and table structure

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS "Appointments" CASCADE;
DROP TABLE IF EXISTS "appointment-queue" CASCADE;
DROP TABLE IF EXISTS "slot-reservation" CASCADE;
DROP TABLE IF EXISTS "temporary-availability" CASCADE;
DROP TABLE IF EXISTS "availabilities" CASCADE;
DROP TABLE IF EXISTS "message" CASCADE;
DROP TABLE IF EXISTS "patients" CASCADE;
DROP TABLE IF EXISTS "doctors" CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS "public"."availabilities_day_enum" CASCADE;
DROP TYPE IF EXISTS "public"."Appointments_status_enum" CASCADE;
DROP TYPE IF EXISTS "public"."Appointments_type_enum" CASCADE;
DROP TYPE IF EXISTS "public"."appointment-queue_type_enum" CASCADE;
DROP TYPE IF EXISTS "public"."appointment-queue_priority_enum" CASCADE;
DROP TYPE IF EXISTS "public"."appointment-queue_status_enum" CASCADE;
DROP TYPE IF EXISTS "public"."temporary-availability_changetype_enum" CASCADE;

-- Clear migrations table (optional - will force re-running all migrations)
-- DROP TABLE IF EXISTS "migrations" CASCADE;

-- After running this script, you'll need to run your TypeORM migrations again:
-- npm run migration:run
