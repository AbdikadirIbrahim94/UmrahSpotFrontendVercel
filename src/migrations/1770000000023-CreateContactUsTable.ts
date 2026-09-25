import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateContactUsTable1770000000023 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'contact_us',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'pending'",
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create index on email for faster lookups
        await queryRunner.query(
            `CREATE INDEX idx_contact_us_email ON contact_us(email)`
        );

        // Create index on status for filtering
        await queryRunner.query(
            `CREATE INDEX idx_contact_us_status ON contact_us(status)`
        );

        // Create index on created_at for sorting
        await queryRunner.query(
            `CREATE INDEX idx_contact_us_created_at ON contact_us(created_at)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX idx_contact_us_created_at ON contact_us`);
        await queryRunner.query(`DROP INDEX idx_contact_us_status ON contact_us`);
        await queryRunner.query(`DROP INDEX idx_contact_us_email ON contact_us`);

        // Drop table
        await queryRunner.dropTable('contact_us');
    }
}