import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    ClassTransformer,
    PropertyConfigService,
    NonFieldValidationException,
    EntityNotFoundException,
} from '@nestjs-boilerplate/core';
import {ResetPasswordTokenInvalidException, User} from '@nestjs-boilerplate/user';
import { AccessTokenInvalidException } from '../../exceptions/access-token-invalid.exception';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { UserJwtService } from '../../services/user-jwt.service';
import { ValidatePayloadInput } from '../../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../../dto/validate-payload.output';
import { JwtLoginInput } from '../../dto/jwt-login.input';
import { JwtLoginOutput } from '../../dto/jwt-login.output';
import { JwtLogoutInput } from '../../dto/jwt-logout.input';
import { JwtLogoutOutput } from '../../dto/jwt-logout.output';
import { UserFactory } from '../user.factory';

describe('JwtAuthService', () => {
    const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.e30.ZRrHA1JJJW8opsbCGfG_HACGpVUMN_a9IV7pAx_Zmeo';
    const JTI = 'ff008d0e71d294';
    const IAT = 1633982876051;
    const EXP = 1633982876055;

    let service: JwtAuthService;
    let userRepository: MockProxy<Repository<User>>;
    let userJwtService: MockProxy<UserJwtService> & UserJwtService;
    let config: MockProxy<PropertyConfigService>;

    let user: User;
    let payload: {
        username: string,
        sub: number,
        jti: string,
        iat: number,
        exp: number,
    };
    let validatePayloadInput: ValidatePayloadInput;
    let validatePayloadOutput: ValidatePayloadOutput;
    let jwtLoginInput: JwtLoginInput;
    let jwtLoginOutput: JwtLoginOutput;
    let jwtLogoutInput: JwtLogoutInput;
    let jwtLogoutOutput: JwtLogoutOutput;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        userJwtService = mock<UserJwtService>();
        config = mock<PropertyConfigService>();

        service = new JwtAuthService(userRepository, userJwtService, config);

        user = await UserFactory.makeUser();

        payload = {
            username: user.username,
            sub: user.id,
            jti: JTI,
            iat: IAT,
            exp: EXP,
        };

        validatePayloadInput = { payload };
        validatePayloadOutput = ClassTransformer.toClassObject(ValidatePayloadOutput, user);

        jwtLoginInput = { username: user.username, password: UserFactory.DEFAULT_PASSWORD };
        jwtLoginOutput = { accessToken: ACCESS_TOKEN };

        jwtLogoutInput = { token: ACCESS_TOKEN };
        jwtLogoutOutput = {};
    });

    describe('#validatePayload()', () => {
        it('when input is not valid should return error', async () => {
            userJwtService.validatePayload.mockReturnValue(Promise.reject(AccessTokenInvalidException));

            await expect(service.validatePayload(validatePayloadInput))
                .rejects.toBeInstanceOf(AccessTokenInvalidException);

            expect(userJwtService.validatePayload.mock.calls[0][0]).toBe(validatePayloadInput.payload);
        });

        it('when input is valid should return user', async () => {
            userJwtService.validatePayload.mockReturnValue(Promise.resolve(user));

            expect(await service.validatePayload(validatePayloadInput)).toStrictEqual(validatePayloadOutput);
            expect(userJwtService.validatePayload.mock.calls[0][0]).toBe(validatePayloadInput.payload);
        });
    });

    describe('#login()', () => {
        it('when input is not valid should return validation error', async () => {
            userJwtService.generateAccessToken.mockReturnValue(Promise.reject(EntityNotFoundException));

            await expect(service.login(jwtLoginInput))
                .rejects.toBeInstanceOf(NonFieldValidationException);

            expect(userJwtService.generateAccessToken.mock.calls[0][0]).toBe(jwtLoginInput.username);
        });

        it('when input is valid should return access token', async () => {
            userJwtService.generateAccessToken.mockReturnValue(Promise.resolve(ACCESS_TOKEN));

            expect(await service.login(jwtLoginInput)).toStrictEqual(jwtLoginOutput);
            expect(userJwtService.generateAccessToken.mock.calls[0][0]).toBe(jwtLoginInput.username);
        });
    });

    describe('#logout()', () => {
        it('when input is not valid should return error', async () => {
            userJwtService.revokeAccessToken.mockReturnValue(Promise.reject(AccessTokenInvalidException));
            config.get.mockReturnValue(true);

            await expect(service.logout(jwtLogoutInput))
                .rejects.toBeInstanceOf(AccessTokenInvalidException);

            expect(userJwtService.revokeAccessToken.mock.calls[0][0]).toBe(jwtLogoutInput.token);
        });

        it('when input is valid should return empty output', async () => {
            userJwtService.revokeAccessToken.mockReturnValue(Promise.resolve(null));
            config.get.mockReturnValue(true);

            expect(await service.logout(jwtLogoutInput)).toStrictEqual(jwtLogoutOutput);
            expect(userJwtService.revokeAccessToken.mock.calls[0][0]).toBe(jwtLogoutInput.token);
        });
    });
});
