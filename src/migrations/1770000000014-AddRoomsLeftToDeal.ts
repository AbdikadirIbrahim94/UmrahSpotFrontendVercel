import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoomsLeftToDeal1770000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "deal",
      new TableColumn({
        name: "rooms_left",
        type: "int",
        isNullable: true, // allow existing records to remain valid
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("deal", "rooms_left");
  }
}
