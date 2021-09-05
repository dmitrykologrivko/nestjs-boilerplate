import { ValidatePassword } from '../validation/user.validators';

export class ChangePasswordRequest {

    @ValidatePassword()
    currentPassword: string;

    @ValidatePassword()
    newPassword: string;

}
