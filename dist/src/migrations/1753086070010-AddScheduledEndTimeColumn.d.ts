import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddScheduledEndTimeColumn1753086070010 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
