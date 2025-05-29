import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlockTypeTable1620000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "block_type" (
        "type" VARCHAR PRIMARY KEY NOT NULL,
        "description" TEXT,
        "availableOptions" JSONB
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "block_type"`);
  }
}