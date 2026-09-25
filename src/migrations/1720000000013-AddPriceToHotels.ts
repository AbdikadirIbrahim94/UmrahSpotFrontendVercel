import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPriceToHotels1720000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 🏨 Add `price` column
    await queryRunner.addColumn(
      "hotels",
      new TableColumn({
        name: "price",
        type: "decimal",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: remove both columns
    await queryRunner.dropColumn("hotels", "price");
  }
}
