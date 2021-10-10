import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    ClassTransformer,
    ValidationContainerException,
    NonFieldValidationException,
    ok,
    err,
    EntityNotFoundException
} from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/user';
import { AccessTokenInvalidException } from '../../exceptions/access-token-invalid.exception';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { UserJwtService } from '../../services/user-jwt.service';
import { RevokedToken } from '../../entities/revoked-token.entity';
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

    let service: JwtAuthService;
    let userRepository: MockProxy<Repository<User>>;
    let revokedTokenRepository: MockProxy<Repository<RevokedToken>>;
    let userJwtService: MockProxy<UserJwtService> & UserJwtService;

    let user: User;
    let revokedToken: RevokedToken;
    let payload: {
        username: string,
        sub: number,
        jti: string,
    };
    let validatePayloadInput: ValidatePayloadInput;
    let validatePayloadOutput: ValidatePayloadOutput;
    let jwtLoginInput: JwtLoginInput;
    let jwtLoginOutput: JwtLoginOutput;
    let jwtLogoutInput: JwtLogoutInput;
    let jwtLogoutOutput: JwtLogoutOutput;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        revokedTokenRepository = mock<Repository<RevokedToken>>();
        userJwtService = mock<UserJwtService>();

        service = new JwtAuthService(userRepository, revokedTokenRepository, userJwtService);

        user = await UserFactory.makeUser();

        revokedToken = RevokedToken.create(JTI, user).unwrap();

        payload = {
            username: user.username,
            sub: user.id,
            jti: JTI,
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
            userJwtService.validatePayload.mockReturnValue(Promise.resolve(err(AccessTokenInvalidException)));

            const result = await service.validatePayload(validatePayloadInput);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(AccessTokenInvalidException);
            expect(userJwtService.validatePayload.mock.calls[0][0]).toBe(validatePayloadInput.payload);
        });

        it('when input is valid should return user', async () => {
            userJwtService.validatePayload.mockReturnValue(Promise.resolve(ok(user)));

            const result = await service.validatePayload(validatePayloadInput);

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toStrictEqual(validatePayloadOutput);
            expect(userJwtService.validatePayload.mock.calls[0][0]).toBe(validatePayloadInput.payload);
        });
    });

    describe('#login()', () => {
        it('when input is not valid should return validation error', async () => {
            userJwtService.generateAccessToken.mockReturnValue(Promise.resolve(err(EntityNotFoundException)));

            const result = await service.login(jwtLoginInput);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(NonFieldValidationException);
            expect(userJwtService.generateAccessToken.mock.calls[0][0]).toBe(jwtLoginInput.username);
        });

        it('when input is valid should return access token', async () => {
            userJwtService.generateAccessToken.mockReturnValue(Promise.resolve(ok(ACCESS_TOKEN)));

            const result = await service.login(jwtLoginInput);

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toStrictEqual(jwtLoginOutput);
            expect(userJwtService.generateAccessToken.mock.calls[0][0]).toBe(jwtLoginInput.username);
        });
    });

    describe('#logout()', () => {
        it('when input is not valid should return error', async () => {
            userJwtService.revokeAccessToken.mockReturnValue(Promise.resolve(err(AccessTokenInvalidException)));

            const result = await service.logout(jwtLogoutInput);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(AccessTokenInvalidException);
            expect(userJwtService.revokeAccessToken.mock.calls[0][0]).toBe(jwtLogoutInput.token);
        });

        it('when input is valid should return empty output', async () => {
            userJwtService.revokeAccessToken.mockReturnValue(Promise.resolve(ok(revokedToken)));
            revokedTokenRepository.save.mockReturnValue(Promise.resolve(revokedToken));

            const result = await service.logout(jwtLogoutInput);

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toStrictEqual(jwtLogoutOutput);
            expect(userJwtService.revokeAccessToken.mock.calls[0][0]).toBe(jwtLogoutInput.token);
            expect(revokedTokenRepository.save.mock.calls[0][0]).toBe(revokedToken);
        });
    });
});
