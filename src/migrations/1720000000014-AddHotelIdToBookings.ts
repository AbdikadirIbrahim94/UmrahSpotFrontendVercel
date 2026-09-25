import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddHotelIdColumnToBookings1720000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "bookings",
      new TableColumn({
        name: "hotel_id",
        type: "int",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("bookings", "hotel_id");
  }
}
