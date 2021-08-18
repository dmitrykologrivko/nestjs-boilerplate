import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
    InjectRepository,
    DomainService,
    Result,
    AsyncResult,
    ok,
    err,
} from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';
import { RevokedToken } from '../entities/revoked-token.entity';
import { AccessTokenInvalidException } from '../exceptions/access-token-invalid.exception';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';

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

    async generateAccessToken(username: string): Promise<Result<string, UserNotFoundException>> {
        return AsyncResult.from(this.findUser(username))
            .proceed(async user => {
                const token = await this.jwtService.signAsync({
                    username: user.username,
                    sub: user.id,
                    jti: uuidv4(),
                });

                return ok(token);
            })
            .toPromise();
    }

    async validateAccessToken(token: string): Promise<Result<User, AccessTokenInvalidException>> {
        return AsyncResult.from(this.verifyJwt(token))
            .proceed(payload => this.validatePayload(payload))
            .toPromise();
    }

    async validatePayload(payload: Payload): Promise<Result<User, AccessTokenInvalidException>> {
        return AsyncResult.from(async () => {
                const revokedToken = await this.revokedTokenRepository.findOne({
                    where: { _token: payload.jti },
                });

                if (revokedToken) {
                    return err(new AccessTokenInvalidException());
                }

                return ok(null);
            })
            .proceed(() => {
                return AsyncResult.from(this.findUser(payload.username))
                    .mapErr(() => new AccessTokenInvalidException())
                    .toPromise();
            })
            .toPromise();
    }

    async revokeAccessToken(token: string): Promise<Result<RevokedToken, AccessTokenInvalidException>> {
        return await AsyncResult.from(this.verifyJwt(token))
            .proceed(payload => {
                return AsyncResult.from(this.validatePayload(payload))
                    .map(user => ({ user, payload }))
                    .toPromise();
            })
            .proceed(val => Promise.resolve(RevokedToken.create(val.payload.jti, val.user)))
            .toPromise();
    }

    private async verifyJwt(token: string): Promise<Result<Payload, AccessTokenInvalidException>> {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            return ok(payload);
        } catch (e) {
            return err(new AccessTokenInvalidException());
        }
    }

    private async findUser(username: string): Promise<Result<User, UserNotFoundException>> {
        const user = await this.userRepository.findOne({
            where: { _username: username, _isActive: true },
        });

        if (!user) {
            return err(new UserNotFoundException());
        }

        return ok(user);
    }
}
