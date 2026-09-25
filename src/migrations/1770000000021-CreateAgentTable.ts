import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentTable1770000000021 implements MigrationInterface {
    name = "CreateAgentTable1770000000021";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "agents" (
                "id" SERIAL NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone_number" character varying NOT NULL,
                "password" character varying NOT NULL,
                "agency_name" character varying,
                "agency_code" character varying,
                "tax_id" character varying,
                "company_name" character varying,
                "country" character varying,
                "state" character varying,
                "city" character varying,
                "address" character varying,
                "postal_code" character varying,
                "is_verified" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9c653f28ae19c5884d5baf6a1d9" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_5fdef501c63984b1b98abb1e68c" UNIQUE ("email"),
                CONSTRAINT "UQ_02af23bf16fe2b489685f5b2584" UNIQUE ("phone_number"),
                CONSTRAINT "UQ_370ebf3b1038bad06a2365226d8" UNIQUE ("agency_code")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "agents"
        `);
    }
}