// src/user/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'user123',
        description: 'Логин пользователя (3-20 символов)',
        minLength: 3,
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Логин может содержать только буквы, цифры и подчеркивание'
    })
    username: string;

    @ApiProperty({
        example: 'SecurePassword123!',
        description: 'Пароль',
        minLength: 1,
        maxLength: 32,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(32)
    password: string;
}