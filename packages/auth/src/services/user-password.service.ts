import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
    PropertyConfigService,
    InjectRepository,
    DomainService,
    AsyncResult,
    Result,
    ok,
    err,
} from '@nestjs-boilerplate/core';
import { AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY } from '../constants/auth.properties';
import { User } from '../entities/user.entity';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { CredentialsInvalidException } from '../exceptions/credentials-invalid.exception';
import { ResetPasswordTokenInvalidException } from '../exceptions/reset-password-token-invalid.exception';

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
    ): Promise<Result<User, CredentialsInvalidException>> {
        return await AsyncResult.from(this.findUser(username))
            .mapErr(() => new CredentialsInvalidException())
            .proceed(async (user): Promise<Result<User, CredentialsInvalidException>> => {
                const isPasswordMatch = await user.comparePassword(password);

                if (!isPasswordMatch) {
                    return err(new CredentialsInvalidException());
                }

                return ok(user);
            })
            .toPromise();
    }

    async comparePassword(idOrUsername: number | string, password: string): Promise<boolean> {
        const result = await this.findUser(idOrUsername);

        if (result.isErr()) {
            return false;
        }

        const user = result.unwrap();

        return await user.comparePassword(password);
    }

    async generateResetPasswordToken(user: User) {
        return await this.jwtService.signAsync(
            { sub: user.id, jti: this.getResetPasswordTokenId(user) },
            { expiresIn: this.config.get(AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY) },
        );
    }

    async validateResetPasswordToken(token: string): Promise<Result<User, ResetPasswordTokenInvalidException>> {
        let payload;

        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (e) {
            return err(new ResetPasswordTokenInvalidException());
        }

        const user = await this.userRepository.findOne({
            where: { id: payload.sub, _isActive: true },
        });

        if (!user || this.getResetPasswordTokenId(user) !== payload.jti) {
            return err(new ResetPasswordTokenInvalidException());
        }

        return ok(user);
    }

    async isResetPasswordTokenValid(token: string): Promise<boolean> {
        const result = await this.validateResetPasswordToken(token);
        return result.isOk();
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

    private async findUser(idOrUsername: number | string): Promise<Result<User, UserNotFoundException>> {
        const where: any = { _isActive: true };

        if (typeof idOrUsername === 'number') {
            where.id = idOrUsername;
        }

        if (typeof idOrUsername === 'string') {
            where._username = idOrUsername;
        }

        const user = await this.userRepository.findOne({ where });

        if (!user) {
            return err(new UserNotFoundException());
        }

        return ok(user);
    }
}
