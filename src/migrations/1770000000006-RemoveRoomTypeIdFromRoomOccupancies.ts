import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveRoomTypeIdFromRoomOccupancies1770000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists (safe migration)
    const table = await queryRunner.getTable("room_occupancies");
    const hasColumn = table?.columns.find(col => col.name === "room_type_id");

    if (hasColumn) {
      await queryRunner.dropColumn("room_occupancies", "room_type_id");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "room_occupancies",
      new TableColumn({
        name: "room_type_id",
        type: "int",
        isNullable: true // safe rollback
      })
    );
  }
}
