import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddMissingTables1754048092370 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
