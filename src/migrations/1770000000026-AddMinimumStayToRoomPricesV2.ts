import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMinimumStayToRoomPricesV21770000000026 implements MigrationInterface {  
  public async up(queryRunner: QueryRunner): Promise<void>{
    // Targets the V2 table safely
    await queryRunner.query(`
      ALTER TABLE "room_prices_v2" 
      ADD COLUMN IF NOT EXISTS "minimum_stay" integer DEFAULT 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void>{
    await queryRunner.query(`
      ALTER TABLE "room_prices_v2" 
      DROP COLUMN IF EXISTS "minimum_stay";
    `);
  }
}
