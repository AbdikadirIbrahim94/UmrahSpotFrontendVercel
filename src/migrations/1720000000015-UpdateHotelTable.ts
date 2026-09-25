import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateHotelTable1720000000015 implements MigrationInterface {
    name = 'UpdateHotelTable1720000000015'

  public async up(queryRunner: QueryRunner): Promise<void> {

    // STEP 1 — Add columns as nullable or with defaults
    await queryRunner.query(`
        ALTER TABLE "hotels"
        ADD COLUMN "name_id" text,
        ADD COLUMN "child_policy" text,
        ADD COLUMN "cancellation_policy" text,
        ADD COLUMN "distance_haram_mitres" integer,
        ADD COLUMN "distance_haram_minutes" integer,
        ADD COLUMN "youtube_video_url" varchar,
        ADD COLUMN "google_comments_url" varchar,
        ADD COLUMN "check_in_from" double precision,
        ADD COLUMN "check_out_until" double precision;
    `);

    // STEP 2 — Update existing rows with fallback values
    await queryRunner.query(`
        UPDATE "hotels"
        SET 
            name_id = CONCAT('hotel_', id),
            child_policy = 'N/A',
            cancellation_policy = 'N/A',
            check_in_from = 12,
            check_out_until = 12
        WHERE name_id IS NULL;
    `);

    // STEP 3 — Make columns NOT NULL + UNIQUE
    await queryRunner.query(`
        ALTER TABLE "hotels"
        ALTER COLUMN "name_id" SET NOT NULL,
        ALTER COLUMN "child_policy" SET NOT NULL,
        ALTER COLUMN "cancellation_policy" SET NOT NULL,
        ALTER COLUMN "check_in_from" SET NOT NULL,
        ALTER COLUMN "check_out_until" SET NOT NULL;

        ALTER TABLE "hotels"
        ADD CONSTRAINT "UQ_hotels_name_id" UNIQUE ("name_id");
    `);

    // STEP 4 — Drop old column
    await queryRunner.query(`
        ALTER TABLE "hotels"
        DROP COLUMN IF EXISTS "distance_to_haram";
    `);
}

    public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
        ALTER TABLE "hotels"
        DROP CONSTRAINT IF EXISTS "UQ_hotels_name_id";
    `);

    await queryRunner.query(`
        ALTER TABLE "hotels"
        ADD COLUMN "distance_to_haram" integer;
    `);

    await queryRunner.query(`
        ALTER TABLE "hotels"
        DROP COLUMN "name_id",
        DROP COLUMN "child_policy",
        DROP COLUMN "cancellation_policy",
        DROP COLUMN "distance_haram_mitres",
        DROP COLUMN "distance_haram_minutes",
        DROP COLUMN "youtube_video_url",
        DROP COLUMN "google_comments_url",
        DROP COLUMN "check_in_from",
        DROP COLUMN "check_out_until";
    `);
}

}