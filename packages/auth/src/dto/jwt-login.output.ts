import { BaseLoginOutput } from './base-login.output';

export class JwtLoginOutput extends BaseLoginOutput {
    accessToken: string;
}
