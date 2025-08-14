"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePatientDoctorTables1752650301766 = void 0;
class CreatePatientDoctorTables1752650301766 {
    name = 'CreatePatientDoctorTables1752650301766';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "doctors" ("doctorId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "speciality" character varying NOT NULL, "yearOfExp" integer NOT NULL, "awards" text, "bio" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_62069f52ebba471c91de5d59d61" UNIQUE ("email"), CONSTRAINT "PK_059971ad86db9f4acff1ef31ac2" PRIMARY KEY ("doctorId"))`);
        await queryRunner.query(`CREATE TABLE "patients" ("patientId" uuid NOT NULL DEFAULT uuid_generate_v4(), "mobNum" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a4a55df5f4d18b3492dd21e5faf" UNIQUE ("mobNum"), CONSTRAINT "UQ_64e2031265399f5690b0beba6a5" UNIQUE ("email"), CONSTRAINT "PK_a4541d8ee871783657d9b139463" PRIMARY KEY ("patientId"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TABLE "doctors"`);
    }
}
exports.CreatePatientDoctorTables1752650301766 = CreatePatientDoctorTables1752650301766;
//# sourceMappingURL=1752650301766-CreatePatientDoctorTables.js.map