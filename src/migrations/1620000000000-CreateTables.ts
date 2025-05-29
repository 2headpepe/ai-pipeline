import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1620000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR NOT NULL UNIQUE,
        "password" VARCHAR NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE "pipeline" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nodes" JSONB NOT NULL,
        "edges" JSONB NOT NULL
      );
      
      CREATE TABLE "user_pipelines" (
        "user_id" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
        "pipeline_id" UUID REFERENCES "pipeline"(id) ON DELETE CASCADE,
        PRIMARY KEY ("user_id", "pipeline_id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_pipelines"`);
    await queryRunner.query(`DROP TABLE "pipeline"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}