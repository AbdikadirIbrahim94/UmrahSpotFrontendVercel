import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1720000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "first_name", type: "varchar" },
          { name: "last_name", type: "varchar" },
          { name: "email", type: "varchar", isUnique: true },
          { name: "phone_number", type: "varchar", isNullable: true },
          { name: "country", type: "varchar", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
