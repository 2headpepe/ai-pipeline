import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserSeedService } from './user/user.seed';
import { BlockSeedService } from './block/block.seed.service';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        private readonly userSeedService: UserSeedService,
    ) { }

    async onModuleInit() {
        if (process.env.NODE_ENV === 'development') {
            await this.runSeeds();
        }
    }

    async runSeeds() {
        await this.userSeedService.run();
        console.log('All seeds completed!');
    }
}