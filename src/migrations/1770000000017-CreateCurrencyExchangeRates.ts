import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCurrencyExchangeRates1770000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "currency_exchange_rates",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "from_currency",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "to_currency",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "market_rate",
            type: "decimal",
            precision: 12,
            scale: 8,
            isNullable: false,
          },
          {
            name: "umrahspot_rate",
            type: "decimal",
            precision: 12,
            scale: 8,
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Optional: Create index for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_currency_pair 
      ON currency_exchange_rates(from_currency, to_currency);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("currency_exchange_rates");
  }
}