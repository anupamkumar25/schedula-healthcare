"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddedDobColumn1753167888330 = void 0;
class AddedDobColumn1753167888330 {
    name = 'AddedDobColumn1753167888330';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "patients" ADD "dob" date NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "dob"`);
    }
}
exports.AddedDobColumn1753167888330 = AddedDobColumn1753167888330;
//# sourceMappingURL=1753167888330-AddedDobColumn.js.map