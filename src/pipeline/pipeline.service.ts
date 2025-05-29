// src/pipeline/pipeline.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pipeline } from './entities/pipeline.entity';
import { PipelineDto } from './dto/create-pipeline.dto';
import { UserService } from 'src/user/user.service';
import { Type } from 'src/block/entitities/block-type.entity';
import { BlockService } from 'src/block/block.service';
import { ChatGPTPrompt, ProcessNodeDto, SDPrompt } from 'src/block/dto/process-nodes.dto';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { generateChatGpt, generateStableDiffusion, getLanguages, translateNode } from './utils/ai-api-requests';
import * as deepl from 'deepl-node';


@Injectable()
export class PipelineService {
  private readonly imageDir = '/app/images';
  constructor(
    @InjectRepository(Pipeline)
    private pipelineRepository: Repository<Pipeline>,
    private blockService: BlockService,
    private userService: UserService,
    private readonly httpService: HttpService,
  ) {
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  async getUserPipelines(userId: number): Promise<Pipeline[]> {
    return this.pipelineRepository.find({
      where: { users: { id: userId } },
      relations: ['users'],
    });
  }

  async getPipelineById(userId: number, pipelineId: string): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOne({
      where: {
        id: pipelineId,
        users: { id: userId }
      },
    });

    if (!pipeline) {
      throw new NotFoundException(
        `Pipeline with ID ${pipelineId} not found for user ${userId}`,
      );
    }
    return pipeline;
  }

  async upsertPipeline(userId: number, dto: PipelineDto): Promise<Pipeline> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (dto.nodes) {
      await this.blockService.validateBlockTypes(
        dto.nodes.map(node => node.type)
      );
    }

    // Обновление или создание
    if (dto.id) {
      const existing = await this.pipelineRepository.findOne({
        where: { id: dto.id, users: { id: userId } }
      });

      if (existing) {
        existing.nodes = dto.nodes ?? existing.nodes;
        existing.edges = dto.edges ?? existing.edges;
        return this.pipelineRepository.save(existing);
      }
    }

    const newPipeline = this.pipelineRepository.create({
      ...dto,
      users: [user],
    });

    return this.pipelineRepository.save(newPipeline);
  }

  async processNodes(nodes: ProcessNodeDto[]) {
    const results: ResultType[] = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      const nextNode = i < nodes.length - 1 ? nodes[i + 1] : undefined;
      // Получаем конфигурацию блока из БД
      const blockType = await this.blockService.getBlock(node.type);

      if (!blockType) {
        throw new Error(`Unknown block type: ${node.type}`);
      }

      const nextNodePrompt: NodePrompt | undefined = nextNode && (nextNode.type === 'stablediffusion' ? { type: nextNode.type, prompt: nextNode.data.prompt } : { type: nextNode?.type, prompt: nextNode?.data.prompt });

      const props = node.type === 'stablediffusion' ? { type: node.type, prompt: node.data.prompt, results, nextNode: nextNodePrompt } : { type: node.type, prompt: node.data?.prompt, results, nextNode: nextNodePrompt }

      const result = await this.processNode(props);
      results.push({
        nodeId: node.id,
        type: node.type,
        result,
        status: 'success'
      });
    }

    return results;
  }

  private async processNode(
    props: ProcessNodeProps
  ): Promise<ProcessNodeReturn> {
    switch (props.type) {
      case 'chatgpt':
        return await this.processChatGptNode(props);
      case 'stablediffusion':
        return await this.processStableDiffusionNode(props);
      default:
        return this.processDefaultNode(props);
    }
  }

  private async processChatGptNode(
    { prompt, results, nextNode }: ProcessNodeProps
  ): Promise<ProcessNodeReturn> {
    const isNextBlockImageGenerator = nextNode?.type === 'stablediffusion';

    let chatgptPrompt = generateChatGptPrompt({ results, prompt });

    const preTranslation = (prompt as ChatGPTPrompt).translate?.pre;
    if (preTranslation) {
      chatgptPrompt = await translateNode(chatgptPrompt, preTranslation.source || null, preTranslation.target) ?? chatgptPrompt;
    }

    let result = await generateChatGpt(this.httpService, chatgptPrompt);

    const promptForPromptSD = isNextBlockImageGenerator ? getPromptForSD(result, nextNode.prompt) : undefined;
    const promptForSD = promptForPromptSD ? await generateChatGpt(this.httpService, promptForPromptSD) : undefined;

    const postTranslation = (prompt as ChatGPTPrompt).translate?.post;
    if (postTranslation) {
      result = await translateNode(result, postTranslation.source || null, postTranslation.target) ?? result;
    } else if (preTranslation) {
      result = await translateNode(result, null, sourceLangToTarget(preTranslation.source)) ?? result;
    }

    return { result, prompt: chatgptPrompt, promptForImage: promptForSD };
  }

  private async processStableDiffusionNode({ type, prompt, results }: ProcessNodeProps) {
    const fullPrompt = findPrevPromptForImage(results) ?? prompt?.prompt;
    console.log('Попытка посчитать стабле дифузион:', { fullPrompt });
    return {
      result: await generateStableDiffusion(this.httpService, this.imageDir, fullPrompt),
      prompt: fullPrompt
    }
  }

  private async processDefaultNode(
    { type, prompt, results }: ProcessNodeProps
  ): Promise<ProcessNodeReturn> {
    return { result: `Неизвестный тип блока, мы пока не понимаем, как вы это умудрились сделать.` };
  }

  async getLanguages() {
    return await getLanguages();
  }
}


type NodePrompt = {
  type: 'chatgpt';
  prompt?: ChatGPTPrompt;
} | {
  type: 'stablediffusion';
  prompt: SDPrompt;
}

type ProcessNodeProps = NodePrompt &
{
  results: ResultType[];
  nextNode?: NodePrompt;
}

type ProcessNodeReturn = {
  result?: string;
  prompt?: string;
  promptForImage?: string;
}

type ResultType = {
  nodeId: string,
  type: Type,
  result: ProcessNodeReturn,
  status: 'success' | 'error'
}


const findTextResults = (results: ResultType[]) => results.filter(result => result.type === 'chatgpt' && result.status === 'success');
const findPrevPromptForImage = (results: ResultType[]) => {
  if (!results || !Array.isArray(results)) {
    console.log('пустое', results)
    return undefined;
  }
  for (let i = results.length - 1; i >= 0; i--) {
    const result = results[i];
    console.log(result?.result);
    if (result?.result?.promptForImage) {
      return result.result.promptForImage;
    }
  }
  return undefined;
}



const generateChatGptPrompt = ({ prompt, results }: Omit<ProcessNodeProps, 'nextNodes' | 'type'> & { forImage?: boolean }) => {
  const prevTextResults = findTextResults(results);

  const depth = (prompt as ChatGPTPrompt).options?.depth;
  const style = (prompt as ChatGPTPrompt).options?.style;
  const add = (prompt as ChatGPTPrompt).options?.add;
  const remove = (prompt as ChatGPTPrompt).options?.remove;
  const accent = (prompt as ChatGPTPrompt).options?.accent;

  return `
  [КОНТЕКСТ]
 Ты—senior research assistant с экспертизой в междисциплинарных исследованиях.
 Анализируй запрос по принципам:
 1. Автодополнение → если данные не указаны, используй стандартные параметры
 2. Иерархия важности → расставляй приоритеты в анализе
 3. Гибкость → строго следуй явным указаниям, когда они есть
 [ЗАПРОС]
 ${prompt?.prompt}
 ${prevTextResults.length ? `
[Существующие наработки]
${prevTextResults.map(({ result: { result } }, i) => `[Результат ${i + 1}]: ${result}`).join('\n')}
(Используй эту информацию как контекст для выполнения задачи)
  `: ''}
 [ПАРАМЕТРЫ]
 Если поля не заполнены — определяй автоматически:
 1. Глубина: ${depth ?? `
 - Поверхностный обзор (до 300 слов)
 - Стандартный анализ (500-800 слов)
 - Глубокий dive (1000+ слов) → по умолчанию для сложных тем`}
 2. Стиль: ${style ?? `
 - Академический → *автовыбор для научных тем*
 - Бизнес-аналитика
 - Популярный (для широкой аудитории)`}
 3. Структура:
 - Введение → всегда
 - Основная часть → адаптивные подзаголовки
 - Источники → если нет явного запрета
  [ДОПОЛНИТЕЛЬНО]
 Опциональные уточнения (если нужны):
 - «Акцент на {${accent ?? ''}}»
 - «Исключи {${remove ?? ''}}»
 - «Добавь {${add ?? ''}}»
 `
}

const getPromptForSD = (result: string, currentPrompt?: SDPrompt) => {
  const style = (currentPrompt as SDPrompt).options?.style;

  return `
  [ROLE] 
  Ты —профессиональный инженер промптов для Stable Diffusion с экспертизой в:
  - Фотореализме/арте/аниме/3D
  - Композиции и lighting
  - Стилистических нюансах (киберпанк, фэнтези и др.)
  - Технических параметрах (CFG, семплеры, разрешение)
[Существующие наработки]
${result}
(Используй эту информацию как контекст для выполнения задачи)
[INSTRUCTIONS]
1. Анализируй текстовый запрос пользователя
2. Автоматически дополняй недостающие элементы:
- Стиль → определяй по контексту(реализм / арт / аниме)
  - Композиция → выбирай оптимальную(крупный план / полный рост)
    - Детали → добавляй уместные элементы(одежда, фон, освещение)
      - Настройки → подбирай под тип изображения
      [USER QUERY]
  ${currentPrompt?.prompt}
  ${currentPrompt?.options?.style ? `Стиль: ${style}` : ''} 
  Напиши только positive prompt, без любых других подписей
Например:
(beautiful anime girl: 1.2), (large cute expressive eyes: 1.3), youthful, soft skin, smooth hair, gentle smile, (upper body, close - up: 1.1), subtle blush, delicate eyelashes, light pastel background, soft ambient lighting, intricate anime - style detailing, vibrant colors, (highly detailed, sharp focus)
[Точный промпт с параметрами, весами и негативом]
  `;
}


const sourceLangToTarget = (lang: deepl.SourceLanguageCode): deepl.TargetLanguageCode => {
  if (lang === 'en') {
    return 'en-US';
  }
  if (lang === 'pt') {
    return 'pt-PT';
  }
  return lang;
}