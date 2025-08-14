import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStartEndTimeChangeNotesToComplaint1753083858507 implements MigrationInterface {
    name = 'AddStartEndTimeChangeNotesToComplaint1753083858507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualStartTime" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualEndTime" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "complaint" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "complaint"`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualEndTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualStartTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "notes" text`);
    }

}
