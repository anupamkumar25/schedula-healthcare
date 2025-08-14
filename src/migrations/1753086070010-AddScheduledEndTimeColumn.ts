import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScheduledEndTimeColumn1753086070010 implements MigrationInterface {
    name = 'AddScheduledEndTimeColumn1753086070010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualStartTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualStartTime" TIME`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualEndTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualEndTime" TIME`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualEndTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualEndTime" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualStartTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualStartTime" TIMESTAMP`);
    }

}
