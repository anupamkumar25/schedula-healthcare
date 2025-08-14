"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMessagesTableAgain1754035510634 = void 0;
class CreateMessagesTableAgain1754035510634 {
    name = 'CreateMessagesTableAgain1754035510634';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "message" ("messageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "senderId" uuid NOT NULL, "recipientId" uuid NOT NULL, "content" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b664c8ae63d634326ce5896cecc" PRIMARY KEY ("messageId"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "message"`);
    }
}
exports.CreateMessagesTableAgain1754035510634 = CreateMessagesTableAgain1754035510634;
//# sourceMappingURL=1754035510634-CreateMessagesTableAgain.js.map