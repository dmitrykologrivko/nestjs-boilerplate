import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { getTargetName } from '@nestjs-boilerplate/core';
import { User, UserPasswordService } from '@nestjs-boilerplate/user';
import { UserJwtService } from '../services/user-jwt.service';
import { BaseRevokedTokensService } from '../services/base-revoked-tokens.service';
import { UserFactory } from './user.factory';

export class AuthTestUtils {
    private readonly _userRepository: Repository<User>;
    private readonly _userJwtService: UserJwtService;
    private readonly _userPasswordService: UserPasswordService;
    private readonly _revokedTokensService: BaseRevokedTokensService;

    constructor(app: any) {
        this._userRepository = app.get(`${getTargetName(User)}Repository`);
        this._userJwtService = app.get(UserJwtService);
        this._userPasswordService = app.get(UserPasswordService);
        this._revokedTokensService = app.get(BaseRevokedTokensService);
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

    async generateJwtToken(username: string, password: string) {
        const result = await this._userJwtService.generateAccessToken(username, password);
        return result.unwrap();
    }

    async revokeJwtToken(token: string) {
        if (!this._revokedTokensService) {
            Logger.warn('Revoked Tokens Service is not setup');
        }
        (await this._userJwtService.revokeAccessToken(token))
            .unwrap();
    }

    async getJwtAuthHeader(token: string) {
        return `Bearer ${token}`;
    }

    async generateResetPasswordToken(user: User) {
        return this._userPasswordService.generateResetPasswordToken(user);
    }

    get userRepository(): Repository<User> {
        return this._userRepository;
    }

    get revokedTokensService(): BaseRevokedTokensService {
        return this._revokedTokensService;
    }
}
