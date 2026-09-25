import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateHotelMarkupRates1770000000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "hotel_markup_rates",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "hotel_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "fee_buffer_rate",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: "profit_margin_rate",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: "total_markup_rate",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
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

    // Create index for hotel_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_hotel_markup_hotel_id 
      ON hotel_markup_rates(hotel_id);
    `);

    // Optional: Ensure one markup rate per hotel
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_unique_hotel_markup 
      ON hotel_markup_rates(hotel_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("hotel_markup_rates");
  }
}