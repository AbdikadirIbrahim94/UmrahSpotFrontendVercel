import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBookingTajparkTable1770000000027 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE booking_tajpark (
                id SERIAL PRIMARY KEY,
                stripe_payment_id VARCHAR(255) UNIQUE,
                guest_name VARCHAR(255) NOT NULL,
                guest_email VARCHAR(255) NOT NULL,
                guest_details JSONB,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                rooms JSONB NOT NULL,
                amount_paid DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE booking_tajpark;
        `);
    }

}