import { ValidateUsername, ValidatePassword } from '@nestjs-boilerplate/user';
import { BaseLoginInput } from './base-login.input';

export class JwtLoginInput extends BaseLoginInput {

    @ValidateUsername()
    username: string;

    @ValidatePassword()
    password: string;

}
