import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddStartEndTimeChangeNotesToComplaint1753083858507 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
