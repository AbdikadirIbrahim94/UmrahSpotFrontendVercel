import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBookings2Tables1770000000019
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* ========================= BOOKINGS2 ========================= */
    await queryRunner.createTable(
      new Table({
        name: "bookings2",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "reservation_number",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "booking_number",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "user_id",
            type: "int",
            isNullable: true,
          },
          {
            name: "hotel_id",
            type: "int",
          },
          {
            name: "check_in",
            type: "date",
          },
          {
            name: "check_out",
            type: "date",
          },
          {
            name: "total_guests",
            type: "int",
          },
          {
            name: "total_price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "currency",
            type: "varchar",
            length: "10",
          },
          {
            name: "status",
            type: "enum",
            enum: ["booked", "cancelled", "completed"],
            default: "'booked'",
          },
          {
            name: "payment_status",
            type: "enum",
            enum: ["pending", "paid", "failed"],
            default: "'pending'",
          },
          {
            name: "cancellation_policy",
            type: "text",
            isNullable: true,
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

    /* ====================== BOOKING ROOMS ======================= */
    await queryRunner.createTable(
      new Table({
        name: "booking_rooms",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "booking_id",
            type: "int",
          },
          {
            name: "deal_id",
            type: "int",
          },
          {
            name: "hotel_id",
            type: "int",
          },
          {
            name: "room_id",
            type: "int",
          },
          {
            name: "room_option_id",
            type: "int",
          },
          {
            name: "quantity",
            type: "int",
          },
          {
            name: "base_price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "extras",
            type: "json",
            isNullable: true,
          },
          {
            name: "room_total",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "check_in",
            type: "date",
          },
          {
            name: "check_out",
            type: "date",
          },
        ],
      }),
      true
    );

    /* ==================== BOOKING CUSTOMERS ===================== */
    await queryRunner.createTable(
      new Table({
        name: "booking_customers",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "booking_id",
            type: "int",
          },
          {
            name: "first_name",
            type: "varchar",
          },
          {
            name: "last_name",
            type: "varchar",
          },
          {
            name: "email",
            type: "varchar",
          },
          {
            name: "phone_number",
            type: "varchar",
          },
          {
            name: "address",
            type: "varchar",
          },
          {
            name: "city",
            type: "varchar",
          },
          {
            name: "country",
            type: "varchar",
          },
          {
            name: "postal_code",
            type: "varchar",
          },
          {
            name: "special_requests",
            type: "text",
            isNullable: true,
          },
        ],
      }),
      true
    );

    /* ======================== INDEXES ========================== */
    await queryRunner.query(`
      CREATE INDEX idx_bookings2_hotel_id
      ON bookings2(hotel_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_booking_rooms_booking_id
      ON booking_rooms(booking_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_booking_customers_booking_id
      ON booking_customers(booking_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("booking_customers");
    await queryRunner.dropTable("booking_rooms");
    await queryRunner.dropTable("bookings2");
  }
}
