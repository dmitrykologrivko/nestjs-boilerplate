import {
    Logger,
    Request,
    Body,
    Post,
    UseGuards,
    UsePipes,
    UseFilters,
} from '@nestjs/common';
import {
    ApiController,
    ValidationExceptionsPipe,
    ValidationExceptionsFilter,
} from '@nestjs-boilerplate/core';
import {
    UserService,
    ResetPasswordTokenInvalidExceptionFilter,
} from '@nestjs-boilerplate/user';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthorizedUser } from '../decorators/authorized-user.decorator';
import { BearerToken } from '../decorators/bearer-token.decorator';
import { ChangePasswordRequest } from '../dto/change-password.request';
import { ForgotPasswordRequest } from '../dto/forgot-password.request';
import { ResetPasswordRequest } from '../dto/reset-password.request';
import { ValidateResetPasswordTokenRequest } from '../dto/validate-reset-password-token.request';

@UsePipes(ValidationExceptionsPipe)
@UseFilters(
    ValidationExceptionsFilter,
    ResetPasswordTokenInvalidExceptionFilter,
)
@ApiController('auth/password')
export class AuthPasswordController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('change')
    async changePassword(
        @Request() req,
        @AuthorizedUser() user,
        @BearerToken() token,
        @Body() input: ChangePasswordRequest,
    ) {
        Logger.log(`Attempt to change password (IP ${req.ip})`);

        const result = await this.userService.changePassword({
            userId: user.id,
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
            extra: {
                jwt: token,
            },
        });

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Post('forgot')
    async forgotPassword(@Request() req, @Body() input: ForgotPasswordRequest) {
        Logger.log(`Attempt to send recover password email (IP ${req.ip})`);

        const result = await this.userService.forgotPassword({
            email: input.email,
            host: req.headers.host,
            protocol: req.protocol,
        });

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Post('reset')
    async resetPassword(@Request() req, @Body() input: ResetPasswordRequest) {
        Logger.log(`Attempt to recover password (IP ${req.ip})`);

        const result = await this.userService.resetPassword({
            resetPasswordToken: input.resetPasswordToken,
            newPassword: input.newPassword,
        });

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Post('reset/validate')
    async validateResetPasswordToken(@Body() body: ValidateResetPasswordTokenRequest) {
        return;
    }
}
