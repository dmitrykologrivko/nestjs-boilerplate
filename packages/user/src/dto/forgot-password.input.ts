import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { BaseInput } from '@nestjs-boilerplate/core';
import { EmailActiveConstraint } from '../validation/email-active.constraint';

export class ForgotPasswordInput extends BaseInput {

    @IsEmail()
    @Validate(EmailActiveConstraint)
    email: string;

    @IsNotEmpty()
    host: string;

    @IsNotEmpty()
    protocol: string;

}
