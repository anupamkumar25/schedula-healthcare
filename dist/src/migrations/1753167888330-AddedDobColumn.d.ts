import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddedDobColumn1753167888330 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
