import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class RemoveAwardsFromDoctor1752733715875 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
