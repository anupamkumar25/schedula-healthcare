import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAvailabilityAppointmentTables1752753284912
  implements MigrationInterface
{
  name = 'CreateAvailabilityAppointmentTables1752753284912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."availabilities_day_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
    );
    await queryRunner.query(
      `CREATE TABLE "availabilities" ("availabilityId" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid NOT NULL, "day" "public"."availabilities_day_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_31e1d3097419ac1e6035cead0fe" PRIMARY KEY ("availabilityId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Appointments_status_enum" AS ENUM('upcoming', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Appointments_type_enum" AS ENUM('regular', 'online')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Appointments" ("appointmentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "doctorId" uuid NOT NULL, "patientId" uuid NOT NULL, "appointmentDate" date NOT NULL, "appointmentTime" TIME NOT NULL, "duration" integer NOT NULL DEFAULT '30', "tokenNumber" character varying NOT NULL, "status" "public"."Appointments_status_enum" NOT NULL DEFAULT 'upcoming', "type" "public"."Appointments_type_enum" NOT NULL DEFAULT 'regular', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_93041f5c9cd4f94b38a8fcc10b4" UNIQUE ("tokenNumber"), CONSTRAINT "PK_1ac73173b6d33eb41afbb9d6e82" PRIMARY KEY ("appointmentId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "availabilities" ADD CONSTRAINT "FK_5f08043e96f65e78f60ca2340ae" FOREIGN KEY ("doctorId") REFERENCES "doctors"("doctorId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ADD CONSTRAINT "FK_be5cc8069aeca2709307d9eadcd" FOREIGN KEY ("doctorId") REFERENCES "doctors"("doctorId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ADD CONSTRAINT "FK_9921e07ec8b044f08c979b5a9be" FOREIGN KEY ("patientId") REFERENCES "patients"("patientId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Appointments" DROP CONSTRAINT "FK_9921e07ec8b044f08c979b5a9be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" DROP CONSTRAINT "FK_be5cc8069aeca2709307d9eadcd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "availabilities" DROP CONSTRAINT "FK_5f08043e96f65e78f60ca2340ae"`,
    );
    await queryRunner.query(`DROP TABLE "Appointments"`);
    await queryRunner.query(`DROP TYPE "public"."Appointments_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."Appointments_status_enum"`);
    await queryRunner.query(`DROP TABLE "availabilities"`);
    await queryRunner.query(`DROP TYPE "public"."availabilities_day_enum"`);
  }
}
