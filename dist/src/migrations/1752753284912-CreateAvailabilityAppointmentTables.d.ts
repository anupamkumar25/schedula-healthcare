import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateAvailabilityAppointmentTables1752753284912 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
