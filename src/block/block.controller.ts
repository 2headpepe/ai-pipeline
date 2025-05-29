import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { BlockType } from 'src/block/entitities/block-type.entity';
import { BlockService } from './block.service';

@ApiTags('Блоки')
@Controller('/block')
export class BlockController {
  constructor(private readonly blockService: BlockService,) { }

  @Get()
  @ApiOperation({ summary: 'Get all available blocks' })
  @ApiResponse({ status: 200, description: 'Pipeline created/updated', type: BlockType })
  async getBlocks() {
    return this.blockService.getBlocks();
  }
}
