import { BaseLogoutInput } from './base-logout.input';

export class JwtLogoutInput extends BaseLogoutInput {
    token: string;
}
