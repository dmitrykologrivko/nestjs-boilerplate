import { IsJWT, Validate } from 'class-validator';
import { BaseInput } from '@nestjs-boilerplate/core';
import { ValidatePassword } from '../validation/user.validators';
import { ResetPasswordTokenValidConstraint } from '../validation/reset-password-token-valid.constraint';

export class ResetPasswordInput extends BaseInput {

    @IsJWT()
    @Validate(ResetPasswordTokenValidConstraint)
    resetPasswordToken: string;

    @ValidatePassword()
    newPassword: string;

}
