import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedDobColumn1753167888330 implements MigrationInterface {
  name = 'AddedDobColumn1753167888330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" ADD "dob" date NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "dob"`);
  }
}
