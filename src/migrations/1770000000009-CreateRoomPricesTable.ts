import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoomPricesTable1770000000009 implements MigrationInterface {
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
            name: "hotel_id",
            type: "varchar",
            length: "255",
            isNullable: false, 
          },
          {
            name: "room_option_id",
            type: "varchar",
            length: "255",
            isNullable: false,  // Relation handled only in model
          },
          {
            name: "season_code",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "start_date",
            type: "date",
            isNullable: false,
            comment: "Start date of pricing period",
          },
          {
            name: "end_date",
            type: "date",
            isNullable: false,
            comment: "End date of pricing period",
          },
          {
            name: "day_type",
            type: "varchar",
            length: "20",
            isNullable: false,
            comment: "WEEKDAY or WEEKEND",
          },
          {
            name: "cost_sar",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: "Base cost in Saudi Riyals",
          },
          {
            name: "hb_cost_sar",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: "Half Board cost in Saudi Riyals",
          },
          {
            name: "fb_cost_sar",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: "Full Board cost in Saudi Riyals",
          },
          {
            name: "bb_upgrade_sar",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
            comment: "Bed & Breakfast upgrade cost",
          },
          {
            name: "hb_upgrade_sar",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
            comment: "Half Board upgrade cost",
          },
          {
            name: "fb_upgrade_sar",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
            comment: "Full Board upgrade cost",
          },
          {
            name: "unique_key",
            type: "varchar",
            length: "255",
            isNullable: true,
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
