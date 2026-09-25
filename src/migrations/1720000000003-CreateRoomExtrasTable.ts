import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoomExtrasTable1720000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "room_extras",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "room_id", type: "int", isNullable: true },
          { name: "name", type: "varchar" },
          { name: "price", type: "decimal", precision: 10, scale: 2 },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("room_extras");
  }
}
