import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTableAgain1754035510634
  implements MigrationInterface
{
  name = 'CreateMessagesTableAgain1754035510634';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message" ("messageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "senderId" uuid NOT NULL, "recipientId" uuid NOT NULL, "content" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b664c8ae63d634326ce5896cecc" PRIMARY KEY ("messageId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message"`);
  }
}
