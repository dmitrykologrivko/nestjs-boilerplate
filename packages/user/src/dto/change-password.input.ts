import { IsDefined, Validate } from 'class-validator';
import { BaseInput } from '@nestjs-boilerplate/core';
import { ValidatePassword } from '../validation/user.validators';
import { PasswordMatchConstraint } from '../validation/password-match.constraint';

export class ChangePasswordInput extends BaseInput {

    @IsDefined()
    userId: number;

    @ValidatePassword()
    @Validate(PasswordMatchConstraint)
    currentPassword: string;

    @ValidatePassword()
    newPassword: string;

    token?: string;

}
