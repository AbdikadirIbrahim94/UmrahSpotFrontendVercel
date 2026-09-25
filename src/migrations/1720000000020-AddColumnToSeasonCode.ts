import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnToSeasonCode1720000000020 implements MigrationInterface {
    name = 'AddColumnToSeasonCode1720000000020'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "season_codes",
      new TableColumn({
        name: "description",
        type: "text",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("season_codes", "description");
  }
}