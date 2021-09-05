import { IsDefined, Validate } from 'class-validator';
import { ValidatePassword } from '../validation/user.validators';
import { PasswordMatchConstraint } from '../validation/password-match.constraint';

export class ChangePasswordInput {

    @IsDefined()
    userId: number;

    @ValidatePassword()
    @Validate(PasswordMatchConstraint)
    currentPassword: string;

    @ValidatePassword()
    newPassword: string;

}
