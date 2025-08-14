"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStartEndTimeChangeNotesToComplaint1753083858507 = void 0;
class AddStartEndTimeChangeNotesToComplaint1753083858507 {
    name = 'AddStartEndTimeChangeNotesToComplaint1753083858507';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualStartTime" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualEndTime" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "complaint" text`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "complaint"`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualEndTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualStartTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "notes" text`);
    }
}
exports.AddStartEndTimeChangeNotesToComplaint1753083858507 = AddStartEndTimeChangeNotesToComplaint1753083858507;
//# sourceMappingURL=1753083858507-AddStartEndTimeChangeNotesToComplaint.js.map