import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { User } from './entities/user.entity';
import { Pipeline } from 'src/pipeline/entities/pipeline.entity';

@Injectable()
export class UserSeedService {
    constructor(
        private readonly connection: Connection
    ) { }

    async run() {
        await this.connection.transaction(async manager => {
            const userRepository = manager.getRepository(User);
            const pipelineRepository = manager.getRepository(Pipeline);

            // Создаем тестового пользователя
            const user = await userRepository.save({
                username: 'admin',
                password: 'temp_password', // В реальном приложении хешируйте пароль!
            });

            // Создаем тестовый pipeline
            const pipeline = await pipelineRepository.save({
                nodes: [] as any,
                edges: [] as any
            } as Pipeline);

            // Связываем пользователя с pipeline
            user.pipelines = [pipeline];
            await userRepository.save(user);
        });
    }
}