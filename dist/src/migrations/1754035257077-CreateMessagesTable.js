"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMessagesTable1754035257077 = void 0;
class CreateMessagesTable1754035257077 {
    name = 'CreateMessagesTable1754035257077';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."appointment-queue_priority_enum" RENAME TO "appointment-queue_priority_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."appointment-queue_priority_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "appointment-queue" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointment-queue" ALTER COLUMN "priority" TYPE "public"."appointment-queue_priority_enum" USING "priority"::"text"::"public"."appointment-queue_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "appointment-queue" ALTER COLUMN "priority" SET DEFAULT '2'`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_priority_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."appointment-queue_priority_enum_old" AS ENUM('1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "appointment-queue" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointment-queue" ALTER COLUMN "priority" TYPE "public"."appointment-queue_priority_enum_old" USING "priority"::"text"::"public"."appointment-queue_priority_enum_old"`);
        await queryRunner.query(`ALTER TABLE "appointment-queue" ALTER COLUMN "priority" SET DEFAULT '2'`);
        await queryRunner.query(`DROP TYPE "public"."appointment-queue_priority_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."appointment-queue_priority_enum_old" RENAME TO "appointment-queue_priority_enum"`);
    }
}
exports.CreateMessagesTable1754035257077 = CreateMessagesTable1754035257077;
//# sourceMappingURL=1754035257077-CreateMessagesTable.js.map