import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateReviewsTable1720000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "reviews",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "user_id", type: "int", isNullable: true },
          { name: "hotel_id", type: "int", isNullable: true },
          { name: "rating", type: "int", default: 5 },
          { name: "comment", type: "text", isNullable: true },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("reviews");
  }
}
