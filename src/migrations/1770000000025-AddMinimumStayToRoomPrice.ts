import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMinimumStayToRoomPrices1770000000025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "room_prices" 
      ADD COLUMN IF NOT EXISTS "minimum_stay" integer DEFAULT 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "room_prices" 
      DROP COLUMN IF EXISTS "minimum_stay";
    `);
  }
}