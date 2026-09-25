import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddWebsiteDescriptionAndBaseMealPlan1770000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("room_occupancies", [
      new TableColumn({
        name: "website_description",
        type: "text",
        isNullable: true, // optional — change if needed
      }),
      new TableColumn({
        name: "base_meal_plan",
        type: "varchar",
        length: "255",
        isNullable: true, // optional — change if needed
      }),
      new TableColumn({
        name: "room_option_id",
        type: "varchar",
        length: "255",
        isNullable: true, // optional — change if needed
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("room_occupancies", "website_description");
    await queryRunner.dropColumn("room_occupancies", "base_meal_plan");
    await queryRunner.dropColumn("room_option_id", "base_meal_plan");
  }
}
