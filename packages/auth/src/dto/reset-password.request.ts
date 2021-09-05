import { IsJWT } from 'class-validator';
import { ValidatePassword } from '../validation/user.validators';

export class ResetPasswordRequest {

    @IsJWT()
    resetPasswordToken: string;

    @ValidatePassword()
    newPassword: string;

}
