import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';
globalThis.crypto = { randomUUID } as any; // Полифил для TypeORM
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { BlockModule } from './block/block.module';
import { DatabaseModule } from './database.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrationsRun: true, // Автоматически запускать миграции
        migrations: ['dist/migrations/*.js'],
      }),

      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
    AuthModule,
    UserModule,
    PipelineModule,
    BlockModule,
    DatabaseModule
  ],
})
export class AppModule { }