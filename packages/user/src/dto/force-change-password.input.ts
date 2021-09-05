import { IsDefined, Validate } from 'class-validator';
import { ValidatePassword } from '../validation/user.validators';
import { UsernameExistsConstraint } from '../validation/username-exists.constraint';

export class ForceChangePasswordInput {

    @IsDefined()
    @Validate(UsernameExistsConstraint)
    username: string;

    @ValidatePassword()
    newPassword: string;

}
