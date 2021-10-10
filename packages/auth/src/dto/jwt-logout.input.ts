import { IsJWT } from 'class-validator';
import { BaseLogoutInput } from './base-logout.input';

export class JwtLogoutInput extends BaseLogoutInput {

    @IsJWT()
    token: string;

}
