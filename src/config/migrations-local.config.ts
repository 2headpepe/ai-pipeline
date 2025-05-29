// src/config/migrations-local.config.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { Pipeline } from 'src/pipeline/entities/pipeline.entity';

const configService = new ConfigService();

// Явно указываем сущности вместо glob-паттернов
const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'postgres',
    port: parseInt(configService.get('DB_PORT') || '5432'),
    username: configService.get('DB_USERNAME') || 'postgres',
    password: configService.get('DB_PASSWORD') || 'postgres',
    database: configService.get('DB_DATABASE') || 'ai_pipeline',
    entities: [User, Pipeline], // Явное указание сущностей
    migrations: ['src/db/migrations/*.ts'],
    synchronize: false,
});

export default dataSource;