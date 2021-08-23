import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { EmailActiveConstraint } from '../validation/email-active.constraint';

export class ForgotPasswordInput {

    @IsEmail()
    @Validate(EmailActiveConstraint)
    email: string;

    @IsNotEmpty()
    host: string;

    @IsNotEmpty()
    protocol: string;

}
