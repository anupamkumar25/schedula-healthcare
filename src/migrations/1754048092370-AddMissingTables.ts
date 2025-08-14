import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingTables1754048092370 implements MigrationInterface {
    name = 'AddMissingTables1754048092370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and create availabilities_day_enum if it doesn't exist
        const hasAvailabilitiesDayEnum = await queryRunner.hasColumn('availabilities', 'day');
        if (!hasAvailabilitiesDayEnum) {
            await queryRunner.query(`CREATE TYPE "public"."availabilities_day_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`);
            await queryRunner.query(`CREATE TABLE "availabilities" ("availabilityId" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid NOT NULL, "day" "public"."availabilities_day_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_31e1d3097419ac1e6035cead0fe" PRIMARY KEY ("availabilityId"))`);
        }

        // Check and create Appointments table if it doesn't exist
        const hasAppointmentsTable = await queryRunner.hasTable('Appointments');
        if (!hasAppointmentsTable) {
            await queryRunner.query(`CREATE TYPE "public"."Appointments_status_enum" AS ENUM('upcoming', 'completed', 'cancelled')`);
            await queryRunner.query(`CREATE TYPE "public"."Appointments_type_enum" AS ENUM('routine', 'follow-up', 'new-patient', 'emergency')`);
            await queryRunner.query(`CREATE TABLE "Appointments" ("appointmentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid NOT NULL, "patientId" uuid NOT NULL, "appointmentDate" date NOT NULL, "appointmentTime" TIME NOT NULL, "actualStartTime" TIME, "actualEndTime" TIME, "duration" integer NOT NULL DEFAULT '30', "tokenNumber" character varying NOT NULL, "status" "public"."Appointments_status_enum" NOT NULL DEFAULT 'upcoming', "type" "public"."Appointments_type_enum" NOT NULL DEFAULT 'new-patient', "complaint" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_93041f5c9cd4f94b38a8fcc10b4" UNIQUE ("tokenNumber"), CONSTRAINT "PK_1ac73173b6d33eb41afbb9d6e82" PRIMARY KEY ("appointmentId"))`);
        }

        // Check and create appointment-queue table if it doesn't exist
        const hasAppointmentQueueTable = await queryRunner.hasTable('appointment-queue');
        if (!hasAppointmentQueueTable) {
            await queryRunner.query(`CREATE TYPE "public"."appointment-queue_type_enum" AS ENUM('routine', 'follow-up', 'new-patient', 'emergency')`);
            await queryRunner.query(`CREATE TYPE "public"."appointment-queue_priority_enum" AS ENUM('1', '2')`);
            await queryRunner.query(`CREATE TYPE "public"."appointment-queue_status_enum" AS ENUM('pending', 'processing', 'scheduled', 'failed')`);
            await queryRunner.query(`CREATE TABLE "appointment-queue" ("queueId" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "doctorId" uuid NOT NULL, "requestedDate" date NOT NULL, "preferredTime" TIME, "type" "public"."appointment-queue_type_enum" NOT NULL DEFAULT 'new-patient', "priority" "public"."appointment-queue_priority_enum" NOT NULL DEFAULT '2', "status" "public"."appointment-queue_status_enum" NOT NULL DEFAULT 'pending', "originalAppointmentId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_09a8d2efddf23a57d112962e08e" PRIMARY KEY ("queueId"))`);
        }

        // Check and create temporary-availability table if it doesn't exist
        const hasTemporaryAvailabilityTable = await queryRunner.hasTable('temporary-availability');
        if (!hasTemporaryAvailabilityTable) {
            await queryRunner.query(`CREATE TYPE "public"."temporary-availability_changetype_enum" AS ENUM('expand', 'shrink')`);
            await queryRunner.query(`CREATE TABLE "temporary-availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid NOT NULL, "effectiveDate" date NOT NULL, "changeType" "public"."temporary-availability_changetype_enum" NOT NULL, "originalStartTime" TIME NOT NULL, "originalEndTime" TIME NOT NULL, "newStartTime" TIME NOT NULL, "newEndTime" TIME NOT NULL, "affectedAppointment" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6777d1f77c522e9b81a7709c207" PRIMARY KEY ("id"))`);
        }

        // Check and create message table if it doesn't exist
        const hasMessageTable = await queryRunner.hasTable('message');
        if (!hasMessageTable) {
            await queryRunner.query(`CREATE TABLE "message" ("messageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "senderId" uuid NOT NULL, "recipientId" uuid NOT NULL, "content" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b664c8ae63d634326ce5896cecc" PRIMARY KEY ("messageId"))`);
        }

        // Add foreign key constraints if they don't exist
        if (!hasAvailabilitiesDayEnum) {
            await queryRunner.query(`ALTER TABLE "availabilities" ADD CONSTRAINT "FK_5f08043e96f65e78f60ca2340ae" FOREIGN KEY ("doctorId") REFERENCES "doctors"("doctorId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        if (!hasAppointmentsTable) {
            await queryRunner.query(`ALTER TABLE "Appointments" ADD CONSTRAINT "FK_be5cc8069aeca2709307d9eadcd" FOREIGN KEY ("doctorId") REFERENCES "doctors"("doctorId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            await queryRunner.query(`ALTER TABLE "Appointments" ADD CONSTRAINT "FK_9921e07ec8b044f08c979b5a9be" FOREIGN KEY ("patientId") REFERENCES "patients"("patientId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "Appointments" DROP CONSTRAINT "FK_9921e07ec8b044f08c979b5a9be"`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP CONSTRAINT "FK_be5cc8069aeca2709307d9eadcd"`);
        await queryRunner.query(`ALTER TABLE "availabilities" DROP CONSTRAINT "FK_5f08043e96f65e78f60ca2340ae"`);
        
        // Drop tables
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "temporary-availability"`);
        await queryRunner.query(`DROP TYPE "public"."temporary-availability_changetype_enum"`);
        await queryRunner.query(`DROP TABLE "appointment-queue"`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_type_enum"`);
        await queryRunner.query(`DROP TABLE "Appointments"`);
        await queryRunner.query(`DROP TYPE "public"."Appointments_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Appointments_status_enum"`);
        await queryRunner.query(`DROP TABLE "availabilities"`);
        await queryRunner.query(`DROP TYPE "public"."availabilities_day_enum"`);
    }
}
