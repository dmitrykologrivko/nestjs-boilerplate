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
import { User, ActiveUsersQuery } from '@nestjs-boilerplate/user';
import { RevokedToken } from '../entities/revoked-token.entity';
import { AccessTokenInvalidException } from '../exceptions/access-token-invalid.exception';

export interface Payload {
    username: string;
    sub: number;
    jti: string;
}

@DomainService()
export class UserJwtService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        @InjectRepository(RevokedToken)
        protected readonly revokedTokenRepository: Repository<RevokedToken>,
        private readonly jwtService: JwtService,
    ) {}

    async generateAccessToken(
        username: string,
    ): Promise<Result<string, EntityNotFoundException>> {
        return this.findUser(username)
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
        const revokedToken = await this.revokedTokenRepository.findOne({
            where: { _token: payload.jti },
        });

        if (revokedToken) {
            return err(new AccessTokenInvalidException());
        }

        return this.findUser(payload.username);
    }

    async revokeAccessToken(
        token: string,
    ): Promise<Result<RevokedToken, EntityNotFoundException | AccessTokenInvalidException>> {
        return this.verifyJwt(token)
            .then(proceed(async payload => {
                return (await this.validatePayload(payload))
                    .map(user => ({ user, payload }));
            }))
            .then(proceed(val => Promise.resolve(RevokedToken.create(val.payload.jti, val.user))));
    }

    private async verifyJwt(
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
