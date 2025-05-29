import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlockType } from "./entitities/block-type.entity";

@Injectable()
export class BlockSeedService {
    constructor(
        @InjectRepository(BlockType)
        private readonly blockRepository: Repository<BlockType>,
    ) { }

    async seed() {
        const defaultBlocks: Partial<BlockType>[] = [
            {
                type: 'chatgpt',
                description: 'ChatGPT block for text generation',
                availableOptions: {
                    depth: ['Поверхностный обзор', "Стандартный анализ", 'Глубокое погружение'],
                    style: ['Официальный (деловой, формальный)', 'Научный', 'Публицистический (журналистский)', 'Художественный', 'Разговорный (неформальный)', 'Технический'],
                    accent: true,
                    remove: true,
                    add: true
                }
            },
            {
                type: 'stablediffusion',
                description: 'Stable Diffusion block for image generation',
                availableOptions: {
                    style: ['Реализм ', "Мультфильм", 'Минимализм', 'Абстракционизм', 'Поп-арт'],
                }
            },
        ];

        await Promise.all(
            defaultBlocks.map(block =>
                this.blockRepository.upsert(block, ['type']) // Используем upsert вместо save
            )
        );
    }
}