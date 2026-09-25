import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPositionToRoomPhotos1770000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "room_photos",
      new TableColumn({
        name: "position",
        type: "int",
        default: 0,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("room_photos", "position");
  }
}
