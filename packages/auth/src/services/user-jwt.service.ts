import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
    InjectRepository,
    DomainService,
    Result,
    ok,
    err,
    proceed,
    EntityNotFoundException,
} from '@nestjs-boilerplate/core';
import { User, ActiveUsersQuery, CredentialsInvalidException } from '@nestjs-boilerplate/user';
import { BaseRevokedTokensService } from './base-revoked-tokens.service';
import { AccessTokenInvalidException } from '../exceptions/access-token-invalid.exception';
import { RevokedTokensServiceNotConfiguredException } from '../exceptions/revoked-tokens-service-not-configured.exception';

export interface Payload {
    username: string;
    sub: number;
    jti: string;
    iat: number;
    exp: number;
}

@DomainService()
export class UserJwtService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly revokedTokensService?: BaseRevokedTokensService,
    ) {}

    async generateAccessToken(
        username: string,
        password: string,
    ): Promise<Result<string, EntityNotFoundException | CredentialsInvalidException>> {
        return this.findUser(username)
            .then(proceed(async (user: User): Promise<Result<User, CredentialsInvalidException>> => {
                if ((await user.comparePassword(password))) {
                    return ok(user);
                } else {
                    return err(new CredentialsInvalidException());
                }
            }))
            .then(proceed(async user => {
                const token = await this.jwtService.signAsync({
                    username: user.username,
                    sub: user.id,
                    jti: uuidv4(),
                });

                return ok(token);
            }));
    }

    async validateAccessToken(
        token: string,
    ): Promise<Result<User, EntityNotFoundException | AccessTokenInvalidException>> {
        return this.verifyJwt(token)
            .then(proceed(payload => this.validatePayload(payload)));
    }

    async validatePayload(
        payload: Payload,
    ): Promise<Result<User, EntityNotFoundException | AccessTokenInvalidException>> {
        let result = ok<any, AccessTokenInvalidException>(null);

        if (this.revokedTokensService) {
            result = (await this.revokedTokensService.isTokenRevoked(payload.jti))
                .proceed(isTokenRevoked => isTokenRevoked ? err(new AccessTokenInvalidException()) : ok(null));
        }

        return result.proceedAsync(() => this.findUser(payload.username));
    }

    async revokeAccessToken(
        token: string,
    ): Promise<Result<void, EntityNotFoundException | AccessTokenInvalidException | RevokedTokensServiceNotConfiguredException>> {
        return this.verifyJwt(token)
            .then(proceed(async payload => {
                return (await this.validatePayload(payload))
                    .map((): Payload => payload);
            }))
            .then(proceed(async payload => {
                if (!this.revokedTokensService) {
                    return err(new RevokedTokensServiceNotConfiguredException());
                }
                return this.revokedTokensService.revokeToken(payload.jti, payload.exp);
            }));
    }

    async verifyJwt(
        token: string,
    ): Promise<Result<Payload, AccessTokenInvalidException>> {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            return ok(payload);
        } catch (e) {
            return err(new AccessTokenInvalidException());
        }
    }

    private async findUser(
        username: string,
    ): Promise<Result<User, EntityNotFoundException>> {
        const user = await this.userRepository.findOne(
            new ActiveUsersQuery({ username }).toFindOptions(),
        );

        return user
            ? ok(user)
            : err(new EntityNotFoundException());
    }
}
