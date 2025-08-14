import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddDobToPatient1753432116561 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
