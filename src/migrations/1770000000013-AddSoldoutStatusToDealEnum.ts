import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSellingPriceUsdToRoomPrices1770000000013 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "room_prices",
            new TableColumn({
                name: "selling_price_usd",
                type: "decimal",
                precision: 10,
                scale: 2,
                isNullable: true,
                comment: "Selling price in USD"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("room_prices", "selling_price_usd");
    }
}
