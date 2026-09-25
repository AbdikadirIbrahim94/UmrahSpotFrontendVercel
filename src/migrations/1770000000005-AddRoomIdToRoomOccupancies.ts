import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoomIdToRoomOccupancies1770000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "room_occupancies",
      new TableColumn({
        name: "room_id",
        type: "int",
        isNullable: true, // allow null for existing rows
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("room_occupancies", "room_id");
  }
}
