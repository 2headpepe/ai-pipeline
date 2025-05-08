import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
// import { Pipeline } from './entities/pipeline.entity';
// import { CreatePipelineDto } from './dto/create-pipeline.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // @InjectRepository(Pipeline)
    // private pipelinesRepository: Repository<Pipeline>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findOne(id: number): Promise<User|null> {
    return this.usersRepository.findOne({ where: { id }, relations: ['pipelines'] });
  }

  async findOneByUsername(username: string): Promise<User|null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // async createPipeline(userId: number, createPipelineDto: CreatePipelineDto): Promise<Pipeline> {
  //   const user = await this.findOne(userId);
  //   const pipeline = this.pipelinesRepository.create({
  //     ...createPipelineDto,
  //     user,
  //   });
  //   return this.pipelinesRepository.save(pipeline);
  // }

  // async getUserPipelines(userId: number): Promise<Pipeline[]> {
  //   const user = await this.findOne(userId);
  //   return user.pipelines;
  // }

  // async deletePipeline(userId: number, pipelineId: number): Promise<void> {
  //   const pipeline = await this.pipelinesRepository.findOne({
  //     where: { id: pipelineId, user: { id: userId } },
  //   });
  //   if (pipeline) {
  //     await this.pipelinesRepository.remove(pipeline);
  //   }
  // }

  // async updatePipeline(
  //   userId: number,
  //   pipelineId: number,
  //   updatePipelineDto: CreatePipelineDto,
  // ): Promise<Pipeline> {
  //   const pipeline = await this.pipelinesRepository.findOne({
  //     where: { id: pipelineId, user: { id: userId } },
  //   });
  //   if (!pipeline) {
  //     throw new Error('Pipeline not found');
  //   }
  //   Object.assign(pipeline, updatePipelineDto);
  //   return this.pipelinesRepository.save(pipeline);
  // }
}