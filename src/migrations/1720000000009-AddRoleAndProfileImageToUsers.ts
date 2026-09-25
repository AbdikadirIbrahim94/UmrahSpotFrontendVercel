import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoleAndProfileImageToUsers1720000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("users", [
      new TableColumn({
        name: "role",
        type: "varchar",
        isNullable: false,
        default: "'user'",
      }),
      new TableColumn({
        name: "profile_image",
        type: "varchar",
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "profile_image");
    await queryRunner.dropColumn("users", "role");
  }
}
