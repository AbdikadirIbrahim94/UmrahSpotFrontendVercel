import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPositionToHotelPhotos1770000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "hotel_photos",
      new TableColumn({
        name: "position",
        type: "int",
        default: 0,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("hotel_photos", "position");
  }
}
