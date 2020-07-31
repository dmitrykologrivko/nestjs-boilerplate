import { IsJWT, Validate } from 'class-validator';
import { ResetPasswordTokenValidConstraint } from '../validation/reset-password-token-valid.constraint';

export class ValidateResetPasswordTokenRequest {

    @IsJWT()
    @Validate(ResetPasswordTokenValidConstraint)
    resetPasswordToken: string;

}
