import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreatePatientDoctorTables1752650301766 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
