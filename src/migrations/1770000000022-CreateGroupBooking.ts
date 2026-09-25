import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGroupBooking1770000000022 implements MigrationInterface {
    name = 'CreateGroupBooking1770000000022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."group_bookings_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'on_hold')`);
        
        await queryRunner.query(`
            CREATE TABLE "group_bookings" (
                "id" SERIAL NOT NULL, 
                "agent_id" integer NOT NULL, 
                "groupName" character varying NOT NULL, 
                "makkah_hotel_id" character varying NOT NULL, 
                "makkah_hotel_name" character varying NOT NULL, 
                "madinah_hotel_id" character varying NOT NULL, 
                "madinah_hotel_name" character varying NOT NULL, 
                "rooms" jsonb NOT NULL, 
                "dates" jsonb NOT NULL, 
                "services" jsonb NOT NULL, 
                "totals" jsonb NOT NULL, 
                "notes" text, 
                "status" "public"."group_bookings_status_enum" NOT NULL DEFAULT 'pending', 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_group_bookings" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "group_bookings" 
            ADD CONSTRAINT "FK_group_bookings_agent_id" 
            FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Now it uses the new named constraint for future reverts
        await queryRunner.query(`ALTER TABLE "group_bookings" DROP CONSTRAINT "FK_group_bookings_agent_id"`);
        await queryRunner.query(`DROP TABLE "group_bookings"`);
        await queryRunner.query(`DROP TYPE "public"."group_bookings_status_enum"`);
    }
}