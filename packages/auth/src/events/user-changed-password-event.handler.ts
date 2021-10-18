import { QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
    BaseEventHandler,
    EventFailedException,
    PropertyConfigService,
    Result,
    ok,
    err,
    proceed,
} from '@nestjs-boilerplate/core';
import { UserChangedPasswordEvent } from '@nestjs-boilerplate/user';
import { AUTH_JTW_REVOKE_AFTER_CHANGED_PASSWORD_PROPERTY } from '../constants/auth.properties';
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

    async handle(event: UserChangedPasswordEvent, unitOfWork: QueryRunner): Promise<Result<void, EventFailedException>> {
        const jwt: string = event?.extra?.jwt;
        const canRevoke = this.config.get(AUTH_JTW_REVOKE_AFTER_CHANGED_PASSWORD_PROPERTY);

        if (!jwt || !canRevoke) {
            return ok(null);
        }

        if (canRevoke && !this.revokedTokensService) {
            return err(new EventFailedException('Revoked tokens service is not setup!'));
        }

        return (await this.userJwtService.verifyJwt(jwt)
            .then(proceed(async payload => this.revokedTokensService.revokeToken(payload.jti, payload.exp))))
            .mapErr(() => new EventFailedException('Could not revoke provided JWT'));
    }
}
