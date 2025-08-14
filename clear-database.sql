-- Clear all data from Schedula database tables
-- This script will delete all records but preserve the table structure

-- Clear appointment-related data first (due to foreign key constraints)
DELETE FROM "Appointments";
DELETE FROM "appointment-queue";

-- Clear availability data
DELETE FROM "temporary-availability";
DELETE FROM "availabilities";

-- Clear chat messages
DELETE FROM "message";

-- Clear user data last
DELETE FROM "patients";
DELETE FROM "doctors";

-- Reset sequences if any (PostgreSQL will handle UUIDs automatically)
-- Optional: Reset any auto-increment sequences if you had them

-- Verify tables are empty
SELECT 'Appointments' as table_name, COUNT(*) as record_count FROM "Appointments"
UNION ALL
SELECT 'appointment-queue', COUNT(*) FROM "appointment-queue"
UNION ALL
SELECT 'temporary-availability', COUNT(*) FROM "temporary-availability"
UNION ALL
SELECT 'availabilities', COUNT(*) FROM "availabilities"
UNION ALL
SELECT 'message', COUNT(*) FROM "message"
UNION ALL
SELECT 'patients', COUNT(*) FROM "patients"
UNION ALL
SELECT 'doctors', COUNT(*) FROM "doctors";
