import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateRoomsTable1735900000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old price column (no longer needed)
    // await queryRunner.dropColumn("rooms", "price_per_night");

    // Add base price (optional starting price)
    await queryRunner.addColumn(
      "rooms",
      new TableColumn({
        name: "base_price",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true, // optional
      })
    );

    // Add default occupancy (not enforced as FK)
    await queryRunner.addColumn(
      "rooms",
      new TableColumn({
        name: "default_occupancy_id",
        type: "int",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse changes
    await queryRunner.dropColumn("rooms", "default_occupancy_id");
    await queryRunner.dropColumn("rooms", "base_price");

    // Re-add original price column
    // await queryRunner.addColumn(
    //   "rooms",
    //   new TableColumn({
    //     name: "price_per_night",
    //     type: "decimal",
    //     precision: 10,
    //     scale: 2,
    //     isNullable: true,
    //   })
    // );
  }
}
