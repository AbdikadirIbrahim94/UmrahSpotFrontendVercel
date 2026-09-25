import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoomTypeIdColumn1720000000021 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Just add the column
        await queryRunner.addColumn("rooms", new TableColumn({
            name: "room_type_id",
            type: "integer",
            isNullable: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove column
        await queryRunner.dropColumn("rooms", "room_type_id");
    }
}