import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockType } from 'src/block/entitities/block-type.entity';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { BlockSeedService } from './block.seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlockType])],
  controllers: [BlockController],
  providers: [BlockService, BlockSeedService],
  exports: [BlockService],
})
export class BlockModule {
  constructor(private readonly blockSeedService: BlockSeedService) { }

  async onApplicationBootstrap() {
    await this.blockSeedService.seed();
  }
}