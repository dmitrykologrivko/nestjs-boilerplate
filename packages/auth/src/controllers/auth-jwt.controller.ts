import {
    Post,
    UseGuards,
    UseFilters,
} from '@nestjs/common';
import {
    ApiController,
    ValidationExceptionsFilter,
} from '@nestjs-boilerplate/core';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtAuthService } from '../services/jwt-auth.service';
import { AuthorizedUser } from '../decorators/authorized-user.decorator';
import { BearerToken } from '../decorators/bearer-token.decorator';

@UseFilters(ValidationExceptionsFilter)
@ApiController('auth')
export class AuthJwtController {
    constructor(
        private readonly authService: JwtAuthService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@AuthorizedUser() user) {
        const result = await this.authService.login({ username: user.username });

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
