import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BlockType, Type } from 'src/block/entitities/block-type.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(BlockType)
    private blockTypeRepository: Repository<BlockType>,
  ) { }
  async getBlocks(): Promise<BlockType[]> {
    const blockTypes = await this.blockTypeRepository.find();
    return blockTypes;
  }

  async getBlock(type: Type): Promise<BlockType | null> {
    const blockType = await this.blockTypeRepository.findOne({
      where: { type }
    });
    return blockType;
  }
  async validateBlockTypes(types: string[]): Promise<void> {
    const uniqueTypes = [...new Set(types)];
    const existingTypes = await this.blockTypeRepository.find({
      where: { type: In(uniqueTypes) }
    });

    if (existingTypes.length !== uniqueTypes.length) {
      const missingTypes = uniqueTypes.filter(
        type => !existingTypes.some(t => t.type === type)
      );
      throw new BadRequestException(
        `Unknown block types: ${missingTypes.join(', ')}`
      );
    }
  }
}