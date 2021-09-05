import { IsJWT, Validate } from 'class-validator';
import { ValidatePassword } from '../validation/user.validators';
import { ResetPasswordTokenValidConstraint } from '../validation/reset-password-token-valid.constraint';

export class ResetPasswordInput {

    @IsJWT()
    @Validate(ResetPasswordTokenValidConstraint)
    resetPasswordToken: string;

    @ValidatePassword()
    newPassword: string;

}
