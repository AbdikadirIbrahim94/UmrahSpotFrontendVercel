import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBookingsTable1720000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "bookings",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "reservation_number", type: "varchar", isUnique: true },
          { name: "booking_number", type: "varchar", isUnique: true },
          { name: "user_id", type: "int", isNullable: true },
          { name: "room_id", type: "int", isNullable: true },
          { name: "check_in", type: "date" },
          { name: "check_out", type: "date" },
          { name: "total_guests", type: "int", isNullable: true },
          { name: "total_price", type: "decimal", precision: 10, scale: 2 },
          { name: "status", type: "varchar", default: "'booked'" },
          { name: "cancellation_policy", type: "text", isNullable: true },
          { name: "payment_status", type: "varchar", default: "'pending'" },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("bookings");
  }
}
