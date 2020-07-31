import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PropertyConfigService, SECRET_KEY_PROPERTY } from '@nest-boilerplate/core';
import { JwtAuthService } from '../services/jwt-auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private config: PropertyConfigService,
        private authService: JwtAuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get(SECRET_KEY_PROPERTY),
        });
    }

    async validate(payload: any) {
        const result = await this.authService.validatePayload({ payload });

        if (result.is_err()) {
            throw new UnauthorizedException();
        }

        return result.unwrap();
    }
}
