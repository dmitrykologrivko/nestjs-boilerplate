import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MockProxy, mock } from 'jest-mock-extended';
import { PropertyConfigService, EntityNotFoundException } from '@nestjs-boilerplate/core';
import { USER_PASSWORD_RESET_TIMEOUT_PROPERTY } from '../../constants/user.properties';
import { CredentialsInvalidException } from '../../exceptions/credentials-invalid.exception';
import { ResetPasswordTokenInvalidException } from '../../exceptions/reset-password-token-invalid.exception';
import { User } from '../../entities/user.entity';
import { UserPasswordService } from '../../services/user-password.service';
import { UserFactory } from '../user.factory';

describe('UserPasswordService', () => {
    const ID = 1;
    const USERNAME = UserFactory.DEFAULT_USERNAME;
    const PASSWORD = UserFactory.DEFAULT_PASSWORD;
    const USERNAME_QUERY = { where: { username: USERNAME, isActive: true } };
    const USER_ID_QUERY = { where: { id: ID, isActive: true } };
    const SECRET_KEY = 'ff008d0e71d294';

    let service: UserPasswordService;
    let userRepository: MockProxy<Repository<User>>;
    let jwtService: JwtService;
    let config: MockProxy<PropertyConfigService> & PropertyConfigService;

    let user: User;

    let resetPasswordTokenId: string;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        jwtService = new JwtService({ secret: SECRET_KEY });
        config = mock<PropertyConfigService>();

        service = new UserPasswordService(userRepository, jwtService, config);

        user = await UserFactory.makeUser();

        resetPasswordTokenId = crypto.createHash('sha256')
            .update(`${user.password}${user.created.getTime()}`, 'utf8')
            .digest('hex');
    });

    describe('#validateCredentials()', () => {
        it('when user is not exist should return entity not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.validateCredentials(USERNAME, PASSWORD);

            expect(result.isErr()).toBeTruthy();
            expect(result.unwrapErr()).toBeInstanceOf(EntityNotFoundException);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when password is wrong should return credentials invalid error', async () => {
            const wrongPassword = 'wrong-password';

            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.validateCredentials(USERNAME, wrongPassword);

            expect(result.isErr()).toBeTruthy();
            expect(result.unwrapErr()).toBeInstanceOf(CredentialsInvalidException);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when username and password are correct should return user', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.validateCredentials(USERNAME, PASSWORD);

            expect(result.isOk()).toBeTruthy();
            expect(result.unwrap()).toStrictEqual(user);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });
    });

    describe('#comparePassword()', () => {
        it('when user not found by id should return false', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.comparePassword(ID, PASSWORD);

            expect(result).toBe(false);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USER_ID_QUERY);
        });

        it('when user not found by username should return false', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.comparePassword(USERNAME, PASSWORD);

            expect(result).toBe(false);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when user id and password are match should return true', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.comparePassword(ID, PASSWORD);

            expect(result).toBe(true);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USER_ID_QUERY);
        });

        it('when username and password are match should return true', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.comparePassword(USERNAME, PASSWORD);

            expect(result).toBe(true);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });
    });

    describe('#generateResetPasswordToken()', () => {
        it('should return valid token', async () => {
            config.get.mockReturnValue('1m');

            const token = await service.generateResetPasswordToken(user);

            const payload = await jwtService.verifyAsync(token);

            expect(payload.sub).toBe(user.id);
            expect(payload.jti).toBe(resetPasswordTokenId);

            expect(config.get.mock.calls[0][0]).toBe(USER_PASSWORD_RESET_TIMEOUT_PROPERTY);
        });
    });

    describe('#validateResetPasswordToken()', () => {
        it('when token is not valid should return error', async () => {
            const result = await service.validateResetPasswordToken('wrong-token');

            expect(result.isErr()).toBeTruthy();
            expect(result.unwrapErr()).toBeInstanceOf(ResetPasswordTokenInvalidException);
        });

        it('when token verified but user not exist should return error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(undefined));

            const token = await jwtService.signAsync({ sub: user.id, key: resetPasswordTokenId });

            const result = await service.validateResetPasswordToken(token);

            expect(result.isErr()).toBeTruthy();
            expect(result.unwrapErr()).toBeInstanceOf(ResetPasswordTokenInvalidException);

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USER_ID_QUERY);
        });

        it('when token verified but token id is not valid should return error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const token = await jwtService.signAsync({ sub: user.id, key: 'wrong-key' });

            const result = await service.validateResetPasswordToken(token);

            expect(result.isErr()).toBeTruthy();
            expect(result.unwrapErr()).toBeInstanceOf(ResetPasswordTokenInvalidException);

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USER_ID_QUERY);
        });

        it('when token is valid should return user', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const token = await jwtService.signAsync({ sub: user.id, jti: resetPasswordTokenId });

            const result = await service.validateResetPasswordToken(token);

            expect(result.isOk()).toBeTruthy();
            expect(result.unwrap()).toBe(user);

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USER_ID_QUERY);
        });
    });

    describe('#isResetPasswordTokenValid()', () => {
        it('when token is not valid should return false', async () => {
            const result = await service.isResetPasswordTokenValid('wrong-token');
            expect(result).toBeFalsy();
        });

        it('when token verified but user not exist should return false', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(undefined));

            const token = await jwtService.signAsync({ sub: user.id, jti: resetPasswordTokenId });

            const result = await service.isResetPasswordTokenValid(token);

            expect(result).toBeFalsy();

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USER_ID_QUERY);
        });

        it('when token verified but token id is not valid should return false', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const token = await jwtService.signAsync({ sub: user.id, key: 'wrong-key' });

            const result = await service.isResetPasswordTokenValid(token);

            expect(result).toBeFalsy();

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USER_ID_QUERY);
        });

        it('when token is valid should return true', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const token = await jwtService.signAsync({ sub: user.id, jti: resetPasswordTokenId });

            const result = await service.isResetPasswordTokenValid(token);

            expect(result).toBeTruthy();

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USER_ID_QUERY);
        });
    });
});
