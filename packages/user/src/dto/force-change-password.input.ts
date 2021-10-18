import { IsDefined, Validate } from 'class-validator';
import { BaseInput } from '@nestjs-boilerplate/core';
import { ValidatePassword } from '../validation/user.validators';
import { UsernameExistsConstraint } from '../validation/username-exists.constraint';

export class ForceChangePasswordInput extends BaseInput {

    @IsDefined()
    @Validate(UsernameExistsConstraint)
    username: string;

    @ValidatePassword()
    newPassword: string;

}
