import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PropertyConfigService, SECRET_KEY_PROPERTY } from '@nestjs-boilerplate/core';
import { JwtAuthService } from '../services/jwt-auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: PropertyConfigService,
        private authService: JwtAuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get(SECRET_KEY_PROPERTY),
        });
    }

    async validate(payload: any) {
        try {
            return await this.authService.validatePayload({ payload });
        } catch (_) {
            throw new UnauthorizedException();
        }
    }
}
