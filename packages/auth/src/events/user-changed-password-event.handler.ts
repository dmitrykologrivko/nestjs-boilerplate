import { QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
    BaseEventHandler,
    EventFailedException,
    PropertyConfigService,
} from '@nestjs-boilerplate/core';
import { UserChangedPasswordEvent } from '@nestjs-boilerplate/user';
import { AUTH_JWT_REVOKE_AFTER_CHANGED_PASSWORD_PROPERTY } from '../constants/auth.properties';
import { BaseRevokedTokensService } from '../services/base-revoked-tokens.service';
import { UserJwtService } from '../services/user-jwt.service';

@Injectable()
export class UserChangedPasswordEventHandler extends BaseEventHandler<UserChangedPasswordEvent, QueryRunner> {
    constructor(
        private readonly revokedTokensService: BaseRevokedTokensService,
        private readonly userJwtService: UserJwtService,
        private readonly config: PropertyConfigService,
    ) {
        super();
    }

    supports(): string[] {
        return [UserChangedPasswordEvent.NAME];
    }

    async handle(event: UserChangedPasswordEvent, _: QueryRunner): Promise<void> {
        const jwt: string = event.token;
        const canRevoke = this.config.get(AUTH_JWT_REVOKE_AFTER_CHANGED_PASSWORD_PROPERTY);

        if (!jwt || !canRevoke) {
            return null;
        }

        if (canRevoke && !this.revokedTokensService) {
            throw new EventFailedException('Revoked tokens service is not setup!');
        }

        try {
            const payload = await this.userJwtService.verifyJwt(jwt);
            await this.revokedTokensService.revokeToken(payload.jti, payload.exp);
        } catch (_) {
            throw new EventFailedException('Could not revoke provided JWT');
        }
    }
}
