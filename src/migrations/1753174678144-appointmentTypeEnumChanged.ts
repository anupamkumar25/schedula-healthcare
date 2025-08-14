import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppointmentTypeEnumChanged1753174678144
  implements MigrationInterface
{
  name = 'AppointmentTypeEnumChanged1753174678144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."Appointments_type_enum" RENAME TO "Appointments_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Appointments_type_enum" AS ENUM('routine', 'follow-up', 'new-patient', 'emergency')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ALTER COLUMN "type" TYPE "public"."Appointments_type_enum" USING "type"::"text"::"public"."Appointments_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ALTER COLUMN "type" SET DEFAULT 'new-patient'`,
    );
    await queryRunner.query(`DROP TYPE "public"."Appointments_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."Appointments_type_enum_old" AS ENUM('regular', 'online')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ALTER COLUMN "type" TYPE "public"."Appointments_type_enum_old" USING "type"::"text"::"public"."Appointments_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Appointments" ALTER COLUMN "type" SET DEFAULT 'regular'`,
    );
    await queryRunner.query(`DROP TYPE "public"."Appointments_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."Appointments_type_enum_old" RENAME TO "Appointments_type_enum"`,
    );
  }
}
