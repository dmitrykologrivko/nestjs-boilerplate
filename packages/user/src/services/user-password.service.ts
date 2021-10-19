import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
    PropertyConfigService,
    InjectRepository,
    DomainService,
    Result,
    ok,
    err,
    proceed,
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

    async validateCredentials(
        username: string,
        password: string,
    ): Promise<Result<User, EntityNotFoundException | CredentialsInvalidException>> {
        return this.findUser(username)
            .then(proceed(async user => {
                const isPasswordMatch = await user.comparePassword(password);
                return isPasswordMatch
                    ? ok(user)
                    : err(new CredentialsInvalidException());
            }));
    }

    async comparePassword(
        idOrUsername: number | string,
        password: string,
    ): Promise<boolean> {
        const result = await this.findUser(idOrUsername);
        return result.isOk()
            ? await result.unwrap().comparePassword(password)
            : false;
    }

    async generateResetPasswordToken(user: User) {
        return await this.jwtService.signAsync(
            { sub: user.id, jti: this.getResetPasswordTokenId(user) },
            { expiresIn: this.config.get(USER_PASSWORD_RESET_TIMEOUT_PROPERTY) },
        );
    }

    async validateResetPasswordToken(
        token: string,
    ): Promise<Result<User, ResetPasswordTokenInvalidException>> {
        let payload;

        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (e) {
            return err(new ResetPasswordTokenInvalidException());
        }

        const user = await this.userRepository.findOne(
            new ActiveUsersQuery({ id: payload.sub }).toFindOptions(),
        );

        if (!user || this.getResetPasswordTokenId(user) !== payload.jti) {
            return err(new ResetPasswordTokenInvalidException());
        }

        return ok(user);
    }

    async isResetPasswordTokenValid(token: string): Promise<boolean> {
        return (await this.validateResetPasswordToken(token)).isOk();
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
    ): Promise<Result<User, EntityNotFoundException>> {
        let query: ActiveUsersQuery;

        if (typeof idOrUsername === 'number') {
            query = new ActiveUsersQuery({ id: idOrUsername });
        }

        if (typeof idOrUsername === 'string') {
            query = new ActiveUsersQuery({ username: idOrUsername });
        }

        const user = await this.userRepository.findOne(query.toFindOptions());

        return user
            ? ok(user)
            : err(new EntityNotFoundException());
    }
}
