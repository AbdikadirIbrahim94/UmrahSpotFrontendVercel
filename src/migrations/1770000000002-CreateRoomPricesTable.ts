import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoomPricesTable1735900000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "room_prices",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "room_id",
            type: "int",
            isNullable: false,  // Relation handled only in model
          },
          {
            name: "occupancy_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "season_code_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "price_per_night",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("room_prices");
  }
}
