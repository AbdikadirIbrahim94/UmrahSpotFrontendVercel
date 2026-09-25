import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateHotelPhotosTable1720000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "hotel_photos",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "hotel_id", type: "int", isNullable: true },
          { name: "image_url", type: "varchar" },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("hotel_photos");
  }
}
