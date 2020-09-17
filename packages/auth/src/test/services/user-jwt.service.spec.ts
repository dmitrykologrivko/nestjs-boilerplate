import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserNotFoundException } from '../../exceptions/user-not-found-exception';
import { AccessTokenInvalidException } from '../../exceptions/access-token-invalid.exception';
import { User } from '../../entities/user.entity';
import { RevokedToken } from '../../entities/revoked-token.entity';
import { UserJwtService, Payload } from '../../services/user-jwt.service';
import { UserFactory } from '../user.factory';

describe('UserJwtService', () => {
    const USERNAME = UserFactory.DEFAULT_USERNAME;
    const JTI = 'ff008c0f71d295';
    const USERNAME_QUERY = { where: { _username: USERNAME, _isActive: true } };
    const REVOKED_TOKEN_QUERY = { where: { _token: JTI } };
    const SECRET_KEY = 'ff008d0e71d294';

    let service: UserJwtService;
    let userRepository: MockProxy<Repository<User>>;
    let revokedTokenRepository: MockProxy<Repository<RevokedToken>>;
    let jwtService: JwtService;

    let user: User;
    let revokedToken: RevokedToken;

    let payload: Payload;
    let accessToken: string;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        revokedTokenRepository = mock<Repository<RevokedToken>>();
        jwtService = new JwtService({ secret: SECRET_KEY });

        // TODO: https://github.com/marchaos/jest-mock-extended/issues/36
        // @ts-ignore
        service = new UserJwtService(userRepository, revokedTokenRepository, jwtService);

        user = await UserFactory.makeUser();

        payload = {
            username: user.username,
            sub: user.id,
            jti: JTI,
        };

        revokedToken = RevokedToken.create(payload.jti, user).unwrap();

        accessToken = await jwtService.signAsync(payload);
    });

    describe('#generateAccessToken()', () => {
        it('when user not found should return error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.generateAccessToken(user.username);

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(UserNotFoundException);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when user exist should return valid token', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.generateAccessToken(user.username);

            expect(result.is_ok()).toBeTruthy();

            const token = result.unwrap();

            const resultPayload = await jwtService.verifyAsync(token);

            expect(resultPayload.username).toStrictEqual(payload.username);
            expect(resultPayload.sub).toStrictEqual(payload.sub);
            expect(resultPayload.jti).toBeDefined();
            expect(resultPayload.iat).toBeDefined();

            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });
    });

    describe('#validateAccessToken()', () => {
        it('when jwt is not valid should return error', async () => {
            const result = await service.validateAccessToken('wrong-token');

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(AccessTokenInvalidException);
        });

        it('when token revoked should return error', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(revokedToken));

            const result = await service.validateAccessToken(accessToken);

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
        });

        it('when user not found should return error', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(null));
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.validateAccessToken(accessToken);

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when access token valid should return user', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(null));
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.validateAccessToken(accessToken);

            expect(result.is_ok()).toBeTruthy();
            expect(result.unwrap()).toBe(user);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });
    });

    describe('#validatePayload()', () => {
        it('when token revoked should return error', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(revokedToken));

            const result = await service.validatePayload(payload);

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
        });

        it('when user not found should return error', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(null));
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.validatePayload(payload);

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when access token valid should return user', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(null));
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.validatePayload(payload);

            expect(result.is_ok()).toBeTruthy();
            expect(result.unwrap()).toBe(user);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });
    });

    describe('#revokeAccessToken()', () => {
        it('when token revoked should return error', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(revokedToken));

            const result = await service.revokeAccessToken(accessToken);

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
        });

        it('when user not found should return error', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(null));
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const result = await service.revokeAccessToken(accessToken);

            expect(result.is_err()).toBeTruthy();
            expect(result.unwrap_err()).toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when access token valid should return revoked token', async () => {
            revokedTokenRepository.findOne.mockReturnValue(Promise.resolve(null));
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.revokeAccessToken(accessToken);

            expect(result.is_ok()).toBeTruthy();
            expect(result.unwrap()).toStrictEqual(revokedToken);

            expect(revokedTokenRepository.findOne.mock.calls[0][0]).toEqual(REVOKED_TOKEN_QUERY);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });
    });
});
