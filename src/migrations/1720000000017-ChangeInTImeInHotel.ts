import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInTImeInHotel1720000000017 implements MigrationInterface {
    name = 'ChangeInTImeInHotel1720000000017'

     public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Make child_policy nullable
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "child_policy" DROP NOT NULL
        `);

        // 2. Make cancellation_policy nullable
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "cancellation_policy" DROP NOT NULL
        `);

        // 3. Change check_in_from from float to text
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "check_in_from" TYPE text USING check_in_from::text
        `);

        // 4. Change check_out_until from float to text
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "check_out_until" TYPE text USING check_out_until::text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Revert check_out_until back to float
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "check_out_until" TYPE double precision USING check_out_until::double precision
        `);

        // 2. Revert check_in_from back to float
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "check_in_from" TYPE double precision USING check_in_from::double precision
        `);

        // 3. Make cancellation_policy NOT NULL again (set default for existing nulls)
        await queryRunner.query(`
            UPDATE "hotels" 
            SET "cancellation_policy" = 'TBA' 
            WHERE "cancellation_policy" IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "cancellation_policy" SET NOT NULL
        `);

        // 4. Make child_policy NOT NULL again (set default for existing nulls)
        await queryRunner.query(`
            UPDATE "hotels" 
            SET "child_policy" = 'TBA' 
            WHERE "child_policy" IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "hotels" 
            ALTER COLUMN "child_policy" SET NOT NULL
        `);
    }
}
