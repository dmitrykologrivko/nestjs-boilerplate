import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const result = await this.authService.validateCredentials({ username, password });

        if (result.isErr()) {
            throw new UnauthorizedException();
        }

        return result.unwrap();
    }
}
