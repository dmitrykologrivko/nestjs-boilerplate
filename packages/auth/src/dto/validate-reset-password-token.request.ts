import { IsJWT, Validate } from 'class-validator';
import { ResetPasswordTokenValidConstraint } from '@nestjs-boilerplate/user';

export class ValidateResetPasswordTokenRequest {

    @IsJWT()
    @Validate(ResetPasswordTokenValidConstraint)
    resetPasswordToken: string;

}
