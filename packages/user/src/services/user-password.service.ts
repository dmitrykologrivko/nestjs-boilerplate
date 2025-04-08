import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
    PropertyConfigService,
    InjectRepository,
    DomainService,
    EntityNotFoundException,
} from '@nestjs-boilerplate/core';
import { USER_PASSWORD_RESET_TIMEOUT_PROPERTY } from '../constants/user.properties';
import { User } from '../entities/user.entity';
import { CredentialsInvalidException } from '../exceptions/credentials-invalid.exception';
import { ResetPasswordTokenInvalidException } from '../exceptions/reset-password-token-invalid.exception';
import { ActiveUsersQuery } from '../queries/active-users.query';

@DomainService()
export class UserPasswordService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly config: PropertyConfigService,
    ) {}

    /**
     * Validates user credentials.
     * @param username
     * @param password
     * @throws EntityNotFoundException
     * @throws CredentialsInvalidException
     */
    async validateCredentials(
        username: string,
        password: string,
    ): Promise<User> {
        const user = await this.findUser(username);

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            throw new CredentialsInvalidException();
        }

        return user;
    }

    /**
     * Validates user credentials.
     * @param idOrUsername
     * @param password
     */
    async comparePassword(
        idOrUsername: number | string,
        password: string,
    ): Promise<boolean> {
        return this.findUser(idOrUsername)
            .then(user => user.comparePassword(password))
            .catch(() => false);
    }

    /**
     * Generates a JWT token for resetting the password.
     * @param user
     */
    async generateResetPasswordToken(user: User) {
        return await this.jwtService.signAsync(
            { sub: user.id, jti: this.getResetPasswordTokenId(user) },
            { expiresIn: this.config.get(USER_PASSWORD_RESET_TIMEOUT_PROPERTY) },
        );
    }

    /**
     * Validates the reset password token.
     * @param token
     * @throws ResetPasswordTokenInvalidException
     */
    async validateResetPasswordToken(
        token: string,
    ): Promise<User> {
        let payload;

        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (e) {
            throw new ResetPasswordTokenInvalidException();
        }

        const user = await this.userRepository.findOne(
            new ActiveUsersQuery({ id: payload.sub }).toFindManyOptions(),
        );

        if (!user || this.getResetPasswordTokenId(user) !== payload.jti) {
            throw new ResetPasswordTokenInvalidException();
        }

        return user;
    }

    /**
     * Checks if the reset password token is valid.
     * @param token
     * @throws ResetPasswordTokenInvalidException
     */
    async isResetPasswordTokenValid(token: string): Promise<boolean> {
        return this.validateResetPasswordToken(token)
            .then(() => true)
            .catch(() => false);
    }

    private getResetPasswordTokenId(user: User) {
        /*
         * The user's password hashed by bcrypt that guarantee password has
         * new hash value every time even if a password is the same.
         * It allows us to get one time used key for resetting the password.
         */
        return crypto.createHash('sha256')
            .update(`${user.password}${user.created.getTime()}`, 'utf8')
            .digest('hex');
    }

    private async findUser(
        idOrUsername: number | string,
    ): Promise<User> {
        let query: ActiveUsersQuery;

        if (typeof idOrUsername === 'number') {
            query = new ActiveUsersQuery({ id: idOrUsername });
        }

        if (typeof idOrUsername === 'string') {
            query = new ActiveUsersQuery({ username: idOrUsername });
        }

        const user = await this.userRepository.findOne(query.toFindManyOptions());

        if (!user) {
            throw new EntityNotFoundException();
        }

        return user;
    }
}
