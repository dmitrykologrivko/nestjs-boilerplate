import { MockProxy, mock } from 'jest-mock-extended';
import { ValidationException, Ok, Err } from '@nest-boilerplate/core';
import {
    JWT_TOKEN_VALID_CONSTRAINT,
    USERNAME_ACTIVE_CONSTRAINT,
} from '../../constants/auth.constraints';
import { AuthJwtController } from '../../controllers/auth-jwt.controller';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { UserFactory } from '../user.factory';

describe('AuthJwtController', () => {
    let controller: AuthJwtController;
    let jwtAuthService: MockProxy<JwtAuthService> & JwtAuthService;

    const user = {
        username: UserFactory.DEFAULT_USERNAME,
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
            jwtAuthService.login.mockReturnValue(Promise.resolve(Err(
                new ValidationException(
                    'username',
                    user.username,
                    { [USERNAME_ACTIVE_CONSTRAINT.key]: USERNAME_ACTIVE_CONSTRAINT.message },
                ),
            )));

            await expect(
                controller.login(user),
            ).rejects.toBeInstanceOf(ValidationException);

            expect(jwtAuthService.login.mock.calls[0][0]).toStrictEqual({ username: user.username });
        });

        it('when login successful should return access token', async () => {
            jwtAuthService.login.mockReturnValue(Promise.resolve(Ok(loginResponse)));

            const result = await controller.login(user);

            expect(result).toBe(loginResponse);
            expect(jwtAuthService.login.mock.calls[0][0]).toStrictEqual({ username: user.username });
        });
    });

    describe('#logout()', () => {
        it('when logout unsuccessful should throw error', async () => {
            jwtAuthService.logout.mockReturnValue(Promise.resolve(Err(
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
            jwtAuthService.logout.mockReturnValue(Promise.resolve(Ok(logoutResponse)));

            const result = await controller.logout(accessToken);

            expect(result).toBe(logoutResponse);
            expect(jwtAuthService.logout.mock.calls[0][0]).toStrictEqual({ token: accessToken });
        });
    });
});
