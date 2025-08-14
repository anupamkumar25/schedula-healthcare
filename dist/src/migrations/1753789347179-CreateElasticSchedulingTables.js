"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateElasticSchedulingTables1753789347179 = void 0;
class CreateElasticSchedulingTables1753789347179 {
    name = 'CreateElasticSchedulingTables1753789347179';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."appointment-queue_type_enum" AS ENUM('routine', 'follow-up', 'new-patient', 'emergency')`);
        await queryRunner.query(`CREATE TYPE "public"."appointment-queue_priority_enum" AS ENUM('1', '2', '3')`);
        await queryRunner.query(`CREATE TYPE "public"."appointment-queue_status_enum" AS ENUM('pending', 'processing', 'scheduled', 'failed')`);
        await queryRunner.query(`CREATE TABLE "appointment-queue" ("queueId" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "doctorId" uuid NOT NULL, "requestedDate" date NOT NULL, "preferredTime" TIME, "type" "public"."appointment-queue_type_enum" NOT NULL DEFAULT 'new-patient', "priority" "public"."appointment-queue_priority_enum" NOT NULL DEFAULT '2', "status" "public"."appointment-queue_status_enum" NOT NULL DEFAULT 'pending', "originalAppointmentId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_09a8d2efddf23a57d112962e08e" PRIMARY KEY ("queueId"))`);
        await queryRunner.query(`CREATE TYPE "public"."temporary-availability_changetype_enum" AS ENUM('expand', 'shrink')`);
        await queryRunner.query(`CREATE TABLE "temporary-availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid NOT NULL, "effectiveDate" date NOT NULL, "changeType" "public"."temporary-availability_changetype_enum" NOT NULL, "originalStartTime" TIME NOT NULL, "originalEndTime" TIME NOT NULL, "newStartTime" TIME NOT NULL, "newEndTime" TIME NOT NULL, "affectedAppointment" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6777d1f77c522e9b81a7709c207" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "temporary-availability"`);
        await queryRunner.query(`DROP TYPE "public"."temporary-availability_changetype_enum"`);
        await queryRunner.query(`DROP TABLE "appointment-queue"`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_type_enum"`);
    }
}
exports.CreateElasticSchedulingTables1753789347179 = CreateElasticSchedulingTables1753789347179;
//# sourceMappingURL=1753789347179-CreateElasticSchedulingTables.js.map