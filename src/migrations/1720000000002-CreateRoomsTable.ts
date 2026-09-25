import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoomsTable1720000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "rooms",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "hotel_id", type: "int", isNullable: true },
          { name: "name", type: "varchar" },
          { name: "description", type: "text", isNullable: true },
          { name: "max_guests", type: "int", isNullable: true },
          { name: "bed_type", type: "varchar", isNullable: true },
          { name: "size_sqft", type: "int", isNullable: true },
          { name: "price_per_night", type: "decimal", precision: 10, scale: 2 },
          { name: "refundable", type: "boolean", default: true },
          { name: "free_cancellation_hours", type: "int", default: 48 },
          { name: "breakfast_included", type: "boolean", default: false },
          { name: "view_type", type: "varchar", isNullable: true },
          { name: "image_url", type: "varchar", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("rooms");
  }
}
