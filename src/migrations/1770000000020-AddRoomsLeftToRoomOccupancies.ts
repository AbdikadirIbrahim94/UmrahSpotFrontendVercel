import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoomsLeftToRoomOccupancies1770000000020
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void>{
    await queryRunner.addColumn(
      "room_occupancies",
      new TableColumn({
        name: "rooms_left",
        type: "int",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("room_occupancies", "rooms_left");
  }
}
