import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@ApiTags('Authentication')
@Controller('/auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService,) { }

    @ApiOperation({ summary: 'Вход в систему' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Успешный вход',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Неверные учетные данные',
        schema: {
            example: {
                statusCode: 401,
                message: 'Неверные учетные данные'
            }
        }
    })
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            return {
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Неверные учетные данные'
            };
        }
        return this.authService.login(user);
    }


    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'Пользователь успешно зарегистрирован',
        schema: {
            example: {
                id: 1,
                username: 'user123',
                createdAt: '2023-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Невалидные данные',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'username должен быть строкой',
                    'password должен быть длиннее 8 символов'
                ],
                error: 'Bad Request'
            }
        }
    })
    @ApiResponse({
        status: 409,
        description: 'Пользователь уже существует',
        schema: {
            example: {
                statusCode: 409,
                message: 'Пользователь с таким именем уже существует',
                error: 'Conflict'
            }
        }
    })
    @Post('/register')
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto);
        return this.authService.login(user);
    }
}