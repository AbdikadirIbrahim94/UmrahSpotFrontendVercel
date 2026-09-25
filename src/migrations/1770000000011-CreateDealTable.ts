import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateDealTable1770000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "deal",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "hotel_id",
            type: "int",
            isNullable: true, // no foreign key
          },
          {
            name: "room_id",
            type: "int",
            isNullable: true, // no foreign key
          },
          {
            name: "room_occupancy_id",
            type: "int",
            isNullable: true, // no foreign key
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "discount_type",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "deal_price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "actual_price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "start_date",
            type: "date",
          },
          {
            name: "end_date",
            type: "date",
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "inactive"],
            default: "'active'"
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("deal");
  }
}
