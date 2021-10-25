import { IsEmail } from 'class-validator';

export class ForgotPasswordRequest {

    @IsEmail()
    email: string;

}
