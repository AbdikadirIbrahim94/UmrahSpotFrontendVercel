import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoomOccupanciesTable1735900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "room_occupancies",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "room_type_id",
            type: "int",
            isNullable: false,  // Relation handled only in model
          },
          {
            name: "occupancy",
            type: "text",
            isNullable: false,
          },
          {
            name: "max_guests",
            type: "int",
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
    await queryRunner.dropTable("room_occupancies");
  }
}
