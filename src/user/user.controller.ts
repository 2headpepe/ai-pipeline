import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Пользователь')
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя с пайплайнами',
    schema: {
      example: {
        id: 1,
        username: 'testuser',
        email: 'user@example.com',
        pipelines: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            nodes: [
              {
                id: 'node1',
                type: 'chatgpt',
                position: { x: 100, y: 200 },
                data: { val: 10 }
              }
            ],
            edges: [
              {
                id: 'edge1',
                source: 'node1',
                target: 'node2'
              }
            ]
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  async getProfile(@UserId() userId: number) {
    return this.userService.findOneWithPipelines(userId);
  }
}
