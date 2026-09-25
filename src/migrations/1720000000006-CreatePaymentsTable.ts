import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePaymentsTable1720000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "payments",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "booking_id", type: "int", isNullable: true },
          { name: "method", type: "varchar" },
          { name: "amount", type: "decimal", precision: 10, scale: 2 },
          { name: "currency", type: "varchar", default: "'USD'" },
          { name: "transaction_id", type: "varchar", isNullable: true },
          { name: "status", type: "varchar", default: "'pending'" },
          { name: "created_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("payments");
  }
}
