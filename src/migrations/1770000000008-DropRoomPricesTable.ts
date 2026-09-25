import { MigrationInterface, QueryRunner } from "typeorm";

export class DropRoomPricesTable1770000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("room_prices", true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log("room_prices table will not be recreated automatically.");
  }
}
