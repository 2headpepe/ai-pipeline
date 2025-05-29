import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email или имя пользователя',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        example: 'MySecurePassword123!',
        description: 'Пароль пользователя',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}