import { ValidatePassword } from '@nestjs-boilerplate/user';

export class ChangePasswordRequest {

    @ValidatePassword()
    currentPassword: string;

    @ValidatePassword()
    newPassword: string;

}
