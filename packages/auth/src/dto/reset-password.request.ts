import { IsJWT } from 'class-validator';
import { ValidatePassword } from '@nestjs-boilerplate/user';

export class ResetPasswordRequest {

    @IsJWT()
    resetPasswordToken: string;

    @ValidatePassword()
    newPassword: string;

}
