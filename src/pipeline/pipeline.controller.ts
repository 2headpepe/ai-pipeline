import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { Body, Controller, Get, NotFoundException, Param, Post, Res } from '@nestjs/common';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { PipelineDto } from './dto/create-pipeline.dto';
import { Pipeline } from './entities/pipeline.entity';
import { ProcessNodeDto } from 'src/block/dto/process-nodes.dto';
import path, { join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import { getLanguages } from './utils/ai-api-requests';

@ApiTags('Пайплайн')
@Controller('/pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService,) { }

  @Get('id/:pipelineId')
  @ApiOperation({ summary: 'Get specific user pipeline' })
  @ApiParam({ name: 'pipelineId', type: Number })
  @ApiResponse({ status: 200, description: 'Returns requested pipeline', type: Pipeline })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async getPipeline(@UserId() userId: number, @Param('pipelineId') pipelineId: string,) {
    return this.pipelineService.getPipelineById(userId, pipelineId);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update pipeline' })
  @ApiBody({ type: PipelineDto })
  @ApiResponse({ status: 200, description: 'Pipeline created/updated', type: Pipeline })
  async upsertPipeline(
    @UserId() userId: number,
    @Body() dto: PipelineDto,
  ) {
    return this.pipelineService.upsertPipeline(userId, dto);
  }


  @Post('process')
  async processNodes(@Body() nodes: ProcessNodeDto[]) {
    return this.pipelineService.processNodes(nodes);
  }

  @Get('languages/all')
  async getLanduages() {
    return this.pipelineService.getLanguages();
  }
}

