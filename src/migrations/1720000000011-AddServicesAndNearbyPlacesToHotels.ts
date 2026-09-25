import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddServicesAndNearbyPlacesToHotels1720000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 🏨 Add `services` column
    await queryRunner.addColumn(
      "hotels",
      new TableColumn({
        name: "services",
        type: "jsonb",
        isNullable: true,
      })
    );

    // 🗺️ Add `nearby_places` column
    await queryRunner.addColumn(
      "hotels",
      new TableColumn({
        name: "nearby_places",
        type: "jsonb",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: remove both columns
    await queryRunner.dropColumn("hotels", "services");
    await queryRunner.dropColumn("hotels", "nearby_places");
  }
}
