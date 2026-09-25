import { MigrationInterface, QueryRunner } from "typeorm";

export class RoomTypeAddedAndRoomChanges1720000000018 implements MigrationInterface {
    name = 'RoomTypeAddedAndRoomChanges1720000000018'

   
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create room_type table
        await queryRunner.query(`
            CREATE TABLE "room_type" (
                "id" SERIAL NOT NULL,
                "name" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_room_type_name" UNIQUE ("name"),
                CONSTRAINT "PK_room_type_id" PRIMARY KEY ("id")
            )
        `);

        // Add new columns to rooms table (nullable first)
        await queryRunner.query(`
            ALTER TABLE "rooms" 
            ADD COLUMN "room_name_id" text,
            ADD COLUMN "view_from_room" jsonb NOT NULL DEFAULT '[]',
            ADD COLUMN "roomTypeId" integer
        `);

        // Populate room_name_id with unique values for existing rows
        await queryRunner.query(`
            UPDATE "rooms" 
            SET "room_name_id" = 'room_' || "id"::text
            WHERE "room_name_id" IS NULL
        `);

        // Now make room_name_id NOT NULL
        await queryRunner.query(`
            ALTER TABLE "rooms" 
            ALTER COLUMN "room_name_id" SET NOT NULL
        `);

        // Add unique constraint to room_name_id
        await queryRunner.query(`
            ALTER TABLE "rooms" 
            ADD CONSTRAINT "UQ_rooms_room_name_id" UNIQUE ("room_name_id")
        `);

        // Add foreign key constraint for room_type
        await queryRunner.query(`
            ALTER TABLE "rooms" 
            ADD CONSTRAINT "FK_rooms_room_type" 
            FOREIGN KEY ("roomTypeId") 
            REFERENCES "room_type"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "rooms" 
            DROP CONSTRAINT "FK_rooms_room_type"
        `);

        // Drop new columns from rooms table
        await queryRunner.query(`
            ALTER TABLE "rooms" 
            DROP COLUMN "roomTypeId",
            DROP COLUMN "view_from_room",
            DROP CONSTRAINT "UQ_rooms_room_name_id",
            DROP COLUMN "room_name_id"
        `);

        // Drop room_type table
        await queryRunner.query(`
            DROP TABLE "room_type"
        `);
    }
}