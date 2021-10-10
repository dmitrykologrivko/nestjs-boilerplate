import {
    Post,
    Body,
    UseGuards,
    UseFilters,
} from '@nestjs/common';
import {
    ApiController,
    ValidationExceptionsFilter,
} from '@nestjs-boilerplate/core';
import { AccessTokenInvalidExceptionFilter } from '../filters/access-token-invalid-exception.filter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtAuthService } from '../services/jwt-auth.service';
import { BearerToken } from '../decorators/bearer-token.decorator';
import { JwtLoginInput } from '../dto/jwt-login.input';

@UseFilters(
    ValidationExceptionsFilter,
    AccessTokenInvalidExceptionFilter,
)
@ApiController('auth/jwt')
export class AuthJwtController {
    constructor(
        private readonly authService: JwtAuthService,
    ) {}

    @Post('login')
    async login(@Body() input: JwtLoginInput) {
        const result = await this.authService.login(input);

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@BearerToken() token) {
        const result = await this.authService.logout({ token });

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }
}
