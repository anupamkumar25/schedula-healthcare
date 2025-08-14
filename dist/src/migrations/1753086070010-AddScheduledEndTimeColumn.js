"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddScheduledEndTimeColumn1753086070010 = void 0;
class AddScheduledEndTimeColumn1753086070010 {
    name = 'AddScheduledEndTimeColumn1753086070010';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualStartTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualStartTime" TIME`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualEndTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualEndTime" TIME`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualEndTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualEndTime" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Appointments" DROP COLUMN "actualStartTime"`);
        await queryRunner.query(`ALTER TABLE "Appointments" ADD "actualStartTime" TIMESTAMP`);
    }
}
exports.AddScheduledEndTimeColumn1753086070010 = AddScheduledEndTimeColumn1753086070010;
//# sourceMappingURL=1753086070010-AddScheduledEndTimeColumn.js.map