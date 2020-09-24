import {
    Logger,
    Request,
    Body,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    UseFilters,
} from '@nestjs/common';
import {
    ApiController,
    ValidationPipe,
    ValidationExceptionsFilter,
} from '@nest-boilerplate/core';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { ChangePasswordInput } from '../dto/change-password.input';
import { ForgotPasswordInput } from '../dto/forgot-password.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { ValidateResetPasswordTokenRequest } from '../dto/validate-reset-password-token.request';
import { BindSelfInterceptor } from '../interceptors/bind-self.interceptor';

@UsePipes(ValidationPipe)
@UseFilters(ValidationExceptionsFilter)
@ApiController('auth/password')
export class AuthPasswordController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(BindSelfInterceptor)
    @Post('change')
    async changePassword(@Request() req, @Body() input: ChangePasswordInput) {
        Logger.log(`Attempt to change password (IP ${req.ip})`);

        const result = await this.userService.changePassword(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    @Post('forgot')
    async forgotPassword(@Request() req, @Body() input: ForgotPasswordInput) {
        Logger.log(`Attempt to send recover password email (IP ${req.ip})`);

        const result = await this.userService.forgotPassword(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    @Post('reset')
    async resetPassword(@Request() req, @Body() input: ResetPasswordInput) {
        Logger.log(`Attempt to recover password (IP ${req.ip})`);

        const result = await this.userService.resetPassword(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    @Post('reset/validate')
    async validateResetPasswordToken(@Body() body: ValidateResetPasswordTokenRequest) {
        return;
    }
}
