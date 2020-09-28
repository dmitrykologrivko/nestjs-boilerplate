import { Repository } from 'typeorm';
import { getTargetName } from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';
import { RevokedToken } from '../entities/revoked-token.entity';
import { UserPasswordService } from '../services/user-password.service';
import { UserJwtService } from '../services/user-jwt.service';
import { UserFactory } from './user.factory';

export class AuthTestUtils {
    private readonly _userRepository: Repository<User>;
    private readonly _revokedTokenRepository: Repository<RevokedToken>;
    private readonly _userJwtService: UserJwtService;
    private readonly _userPasswordService: UserPasswordService;

    constructor(app: any) {
        this._userRepository = app.get(`${getTargetName(User)}Repository`);
        this._revokedTokenRepository = app.get(`${RevokedToken.name}Repository`);
        this._userJwtService = app.get(UserJwtService);
        this._userPasswordService = app.get(UserPasswordService);
    }

    async saveUser(user: User) {
        return await this._userRepository.save(user);
    }

    async clearAllUsers() {
        await this._userRepository.clear();
    }

    async makeAndSaveUser() {
        const user = await UserFactory.makeUser();
        return await this.saveUser(user);
    }

    async generateJwtToken(user: User) {
        const result = await this._userJwtService.generateAccessToken(user.username);
        return result.unwrap();
    }

    async revokeJwtToken(token: string) {
        const result = await this._userJwtService.revokeAccessToken(token);
        await this._revokedTokenRepository.save(result.unwrap());
    }

    async getJwtAuthHeader(userOrToken: User | string) {
        return `Bearer ${typeof userOrToken === 'string'
            ? userOrToken
            : await this.generateJwtToken(userOrToken)}`;
    }

    async generateResetPasswordToken(user: User) {
        return this._userPasswordService.generateResetPasswordToken(user);
    }

    get userRepository(): Repository<User> {
        return this._userRepository;
    }

    get revokedTokenRepository(): Repository<RevokedToken> {
        return this._revokedTokenRepository;
    }
}
