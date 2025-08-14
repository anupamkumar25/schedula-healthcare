import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAwardsFromDoctor1752733715875 implements MigrationInterface {
  name = 'RemoveAwardsFromDoctor1752733715875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "awards"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "doctors" ADD "awards" text`);
  }
}
