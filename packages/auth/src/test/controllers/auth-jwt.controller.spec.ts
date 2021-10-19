import { MockProxy, mock } from 'jest-mock-extended';
import { ValidationException, ok, err } from '@nestjs-boilerplate/core';
import {
    JWT_TOKEN_VALID_CONSTRAINT,
    USERNAME_ACTIVE_CONSTRAINT,
} from '@nestjs-boilerplate/user';
import { AuthJwtController } from '../../controllers/auth-jwt.controller';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { UserFactory } from '../user.factory';

describe('AuthJwtController', () => {
    let controller: AuthJwtController;
    let jwtAuthService: MockProxy<JwtAuthService> & JwtAuthService;

    const jwtLoginInput = {
        username: UserFactory.DEFAULT_USERNAME,
        password: UserFactory.DEFAULT_PASSWORD,
    };
    const accessToken = 'qf3fssf54djfsv78';

    const loginResponse = { accessToken };

    const logoutResponse = {};

    beforeEach(() => {
        jwtAuthService = mock<JwtAuthService>();
        controller = new AuthJwtController(jwtAuthService);
    });

    describe('#login()', () => {
        it('when login unsuccessful should throw error', async () => {
            jwtAuthService.login.mockReturnValue(Promise.resolve(err(
                new ValidationException(
                    'username',
                    jwtLoginInput.username,
                    { [USERNAME_ACTIVE_CONSTRAINT.key]: USERNAME_ACTIVE_CONSTRAINT.message },
                ),
            )));

            await expect(
                controller.login(jwtLoginInput),
            ).rejects.toBeInstanceOf(ValidationException);

            expect(jwtAuthService.login.mock.calls[0][0]).toStrictEqual(jwtLoginInput);
        });

        it('when login successful should return access token', async () => {
            jwtAuthService.login.mockReturnValue(Promise.resolve(ok(loginResponse)));

            const result = await controller.login(jwtLoginInput);

            expect(result).toBe(loginResponse);
            expect(jwtAuthService.login.mock.calls[0][0]).toStrictEqual(jwtLoginInput);
        });
    });

    describe('#logout()', () => {
        it('when logout unsuccessful should throw error', async () => {
            jwtAuthService.logout.mockReturnValue(Promise.resolve(err(
                new ValidationException(
                    'token',
                    accessToken,
                    { [JWT_TOKEN_VALID_CONSTRAINT.key]: JWT_TOKEN_VALID_CONSTRAINT.message },
                ),
            )));

            await expect(
                controller.logout(accessToken),
            ).rejects.toBeInstanceOf(ValidationException);

            expect(jwtAuthService.logout.mock.calls[0][0]).toStrictEqual({ token: accessToken });
        });

        it('when logout successful should return empty response', async () => {
            jwtAuthService.logout.mockReturnValue(Promise.resolve(ok(logoutResponse)));

            const result = await controller.logout(accessToken);

            expect(result).toBe(logoutResponse);
            expect(jwtAuthService.logout.mock.calls[0][0]).toStrictEqual({ token: accessToken });
        });
    });
});
