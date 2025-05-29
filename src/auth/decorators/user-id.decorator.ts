// src/auth/decorators/user-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) return null;

        const jwtService = new JwtService();
        const token = authHeader.split(' ')[1];
        const payload = jwtService.verify(token, { secret: process.env.JWT_SECRET });

        return payload.sub; // userId из токена
    },
);