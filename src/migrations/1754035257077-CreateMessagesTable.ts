import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1754035257077 implements MigrationInterface {
  name = 'CreateMessagesTable1754035257077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."appointment-queue_priority_enum" RENAME TO "appointment-queue_priority_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appointment-queue_priority_enum" AS ENUM('1', '2')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment-queue" ALTER COLUMN "priority" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment-queue" ALTER COLUMN "priority" TYPE "public"."appointment-queue_priority_enum" USING "priority"::"text"::"public"."appointment-queue_priority_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment-queue" ALTER COLUMN "priority" SET DEFAULT '2'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."appointment-queue_priority_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."appointment-queue_priority_enum_old" AS ENUM('1', '2', '3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment-queue" ALTER COLUMN "priority" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment-queue" ALTER COLUMN "priority" TYPE "public"."appointment-queue_priority_enum_old" USING "priority"::"text"::"public"."appointment-queue_priority_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment-queue" ALTER COLUMN "priority" SET DEFAULT '2'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."appointment-queue_priority_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."appointment-queue_priority_enum_old" RENAME TO "appointment-queue_priority_enum"`,
    );
  }
}
