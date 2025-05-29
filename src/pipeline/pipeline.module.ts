import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from './entities/pipeline.entity';
import { PipelineService } from './pipeline.service';
import { UserModule } from 'src/user/user.module';
import { BlockModule } from 'src/block/block.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline]), UserModule, BlockModule, HttpModule],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule { }