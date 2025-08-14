"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveAwardsFromDoctor1752733715875 = void 0;
class RemoveAwardsFromDoctor1752733715875 {
    name = 'RemoveAwardsFromDoctor1752733715875';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "awards"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "doctors" ADD "awards" text`);
    }
}
exports.RemoveAwardsFromDoctor1752733715875 = RemoveAwardsFromDoctor1752733715875;
//# sourceMappingURL=1752733715875-RemoveAwardsFromDoctor.js.map