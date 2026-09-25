import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddImageUrlToRoomOccupancies1770000000016
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "room_occupancies",
      new TableColumn({
        name: "image_url",
        type: "varchar",
        isNullable: true, // safe for existing rows
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("room_occupancies", "image_url");
  }
}
