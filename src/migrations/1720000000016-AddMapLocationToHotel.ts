import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMapLocationToHotel1720000000016 implements MigrationInterface {
    name = 'AddMapLocationToHotel1720000000016'
    
 public async up(queryRunner: QueryRunner): Promise<void> {

        // 1️⃣ Add the column as NULLABLE first
        await queryRunner.query(`
            ALTER TABLE "hotels"
            ADD COLUMN "location_map_url" text;
        `);

        // 2️⃣ Set a default value for existing rows
        await queryRunner.query(`
            UPDATE "hotels"
            SET "location_map_url" = 'N/A'
            WHERE "location_map_url" IS NULL;
        `);

        // 3️⃣ Make the column NOT NULL
        await queryRunner.query(`
            ALTER TABLE "hotels"
            ALTER COLUMN "location_map_url" SET NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "hotels"
            DROP COLUMN "location_map_url";
        `);
    }
}