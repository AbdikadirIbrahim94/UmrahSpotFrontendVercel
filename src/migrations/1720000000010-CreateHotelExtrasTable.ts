import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateHotelExtrasTable1720000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "hotel_extras",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "type", type: "varchar", length: "50" },
          { name: "name", type: "varchar", length: "255" },
          { name: "thumbnail", type: "varchar", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()", onUpdate: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("hotel_extras");
  }
}
