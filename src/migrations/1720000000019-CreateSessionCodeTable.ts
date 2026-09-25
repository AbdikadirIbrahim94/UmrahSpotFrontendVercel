import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSessionCodeTable1720000000019 implements MigrationInterface {
    name = 'CreateSessionCodeTable1720000000019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "season_codes",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "season_code_id",
                        type: "text",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "name",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "start_date",
                        type: "date",
                        isNullable: false,
                    },
                    {
                        name: "end_date",
                        type: "date",
                        isNullable: false,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "NOW()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "NOW()",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("season_codes");
    }
}