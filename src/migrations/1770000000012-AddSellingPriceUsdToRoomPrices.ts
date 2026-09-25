import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoldoutStatusToDealEnum1770000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new enum value
    await queryRunner.query(`
      ALTER TYPE "deal_status_enum" ADD VALUE IF NOT EXISTS 'soldout';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values easily.
    // We recreate the enum without 'soldout'

    await queryRunner.query(`
      ALTER TABLE "deal" ALTER COLUMN "status" DROP DEFAULT;
    `);

    await queryRunner.query(`
      CREATE TYPE "deal_status_enum_new" AS ENUM ('active', 'inactive');
    `);

    await queryRunner.query(`
      ALTER TABLE "deal"
      ALTER COLUMN "status" TYPE "deal_status_enum_new" USING status::text::deal_status_enum_new;
    `);

    await queryRunner.query(`
      DROP TYPE "deal_status_enum";
    `);

    await queryRunner.query(`
      ALTER TYPE "deal_status_enum_new" RENAME TO "deal_status_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE "deal" ALTER COLUMN "status" SET DEFAULT 'active';
    `);
  }
}
