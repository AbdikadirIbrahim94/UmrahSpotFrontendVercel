import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateHotelsTable1720000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "hotels",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "city_id", type: "int", isNullable: true },
          { name: "name", type: "varchar" },
          { name: "address", type: "varchar", isNullable: true },
          { name: "distance_to_haram", type: "int", isNullable: true },
          { name: "description", type: "text", isNullable: true },
          { name: "rating", type: "float", default: 0 },
          { name: "image_url", type: "varchar", isNullable: true },
          { name: "amenities", type: "jsonb", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("hotels");
  }
}
