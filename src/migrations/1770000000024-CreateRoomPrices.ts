import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoomPricesV21770000000024 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(
            new Table({
                name: "room_prices_v2",
                columns: [
                    {
                        name: "id",
                        type: "serial",
                        isPrimary: true,
                    },
                    {
                        name: "room_option_id",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "season_code",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "start_date",
                        type: "date",
                    },
                    {
                        name: "end_date",
                        type: "date",
                    },
                    {
                        name: "weekday_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "weekend_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "unique_key",
                        type: "varchar",
                        length: "255",
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
                    },
                ],

                uniques: [
                    {
                        name: "IDX_UNIQUE_ROOM_PRICE_V2",
                        columnNames: [
                            "room_option_id",
                            "start_date",
                            "end_date"
                        ],
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("room_prices_v2");
    }
}