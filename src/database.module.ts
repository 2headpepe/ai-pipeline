import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeedService } from './user/user.seed';
import { SeedService } from './seed.service';
import { BlockSeedService } from './block/block.seed.service';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    providers: [SeedService, UserSeedService],
    exports: [SeedService],
})
export class DatabaseModule { }