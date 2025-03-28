import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository, DomainService, EntityNotFoundException } from '@nestjs-boilerplate/core';
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

    /**
     * Generate a new access token for the user
     * @param username
     * @param password
     * @throws EntityNotFoundException
     * @throws CredentialsInvalidException
     */
    async generateAccessToken(username: string, password: string): Promise<string> {
        const user = await this.findUser(username);

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            throw new CredentialsInvalidException();
        }

        return this.jwtService.signAsync({
            username: user.username,
            sub: user.id,
            jti: uuidv4(),
        });
    }

    /**
     * Generate a new access token for the user
     * @param token
     * @throws EntityNotFoundException
     * @throws AccessTokenInvalidException
     */
    async validateAccessToken(token: string): Promise<User> {
        const payload = await this.verifyJwt(token);
        return this.validatePayload(payload);
    }

    /**
     * Validate the payload of the JWT token
     * @param payload
     * @throws EntityNotFoundException
     * @throws AccessTokenInvalidException
     */
    async validatePayload(payload: Payload): Promise<User> {
        if (this.revokedTokensService) {
            const isTokenRevoked = await this.revokedTokensService.isTokenRevoked(payload.jti);
            if (isTokenRevoked) {
                throw new AccessTokenInvalidException();
            }
        }

        return this.findUser(payload.username);
    }

    /**
     * Revoke the access token
     * @param token
     * @throws EntityNotFoundException
     * @throws AccessTokenInvalidException
     * @throws RevokedTokensServiceNotConfiguredException
     */
    async revokeAccessToken(token: string): Promise<void> {
        const payload = await this.verifyJwt(token);
        await this.validatePayload(payload);

        if (!this.revokedTokensService) {
            throw new RevokedTokensServiceNotConfiguredException();
        }

        await this.revokedTokensService.revokeToken(payload.jti, payload.exp);
    }

    /**
     * Verify the JWT token
     * @param token
     * @throws AccessTokenInvalidException
     */
    async verifyJwt(token: string): Promise<Payload> {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch (e) {
            throw new AccessTokenInvalidException();
        }
    }

    /**
     * Find user by username
     * @param username
     * @private
     * @throws EntityNotFoundException
     */
    private async findUser(username: string): Promise<User> {
        const user = await this.userRepository.findOne(
            new ActiveUsersQuery({ username }).toFindOptions(),
        );

        if (!user) {
            throw new EntityNotFoundException();
        }

        return user;
    }
}
