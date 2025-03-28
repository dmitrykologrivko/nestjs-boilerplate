import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { EntityNotFoundException } from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/user';
import { MockProxy, mock } from 'jest-mock-extended';
import { AccessTokenInvalidException } from '../../exceptions/access-token-invalid.exception';
import { UserJwtService, Payload } from '../../services/user-jwt.service';
import { BaseRevokedTokensService } from '../../services/base-revoked-tokens.service';
import { UserFactory } from '../user.factory';

describe('UserJwtService', () => {
    const USERNAME = UserFactory.DEFAULT_USERNAME;
    const PASSWORD = UserFactory.DEFAULT_PASSWORD;
    const JTI = 'ff008c0f71d295';
    const IAT = 1633982876051;
    const EXP = 1633982876055;
    const USERNAME_QUERY = { where: { username: USERNAME, isActive: true } };
    const SECRET_KEY = 'ff008d0e71d294';

    let service: UserJwtService;
    let userRepository: MockProxy<Repository<User>>;
    let jwtService: JwtService;
    let revokedTokensService: MockProxy<BaseRevokedTokensService>;

    let user: User;

    let payload: Payload;
    let accessToken: string;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        jwtService = new JwtService({ secret: SECRET_KEY });
        revokedTokensService = mock<BaseRevokedTokensService>();

        service = new UserJwtService(
            userRepository,
            jwtService,
            revokedTokensService,
        );

        user = await UserFactory.makeUser();

        payload = {
            username: user.username,
            sub: user.id,
            jti: JTI,
            iat: IAT,
            exp: EXP,
        };

        accessToken = await jwtService.signAsync(payload);
    });

    describe('#generateAccessToken()', () => {
        it('when user not found should return error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            await expect(service.generateAccessToken(USERNAME, PASSWORD))
                .rejects.toBeInstanceOf(EntityNotFoundException);

            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when user exist should return valid token', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const token = await service.generateAccessToken(USERNAME, PASSWORD);
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
            await expect(service.validateAccessToken('wrong-token'))
                .rejects.toBeInstanceOf(AccessTokenInvalidException);
        });

        it('when token revoked should return error', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(true);

            await expect(service.validateAccessToken(accessToken))
                .rejects.toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
        });

        it('when user not found should return error', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(false);
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            await expect(service.validateAccessToken(accessToken))
                .rejects.toBeInstanceOf(EntityNotFoundException);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when access token valid should return user', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(false);
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            expect(await service.validateAccessToken(accessToken)).toBe(user);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });
    });

    describe('#validatePayload()', () => {
        it('when token revoked should return error', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(true);

            await expect(service.validatePayload(payload))
                .rejects.toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
        });

        it('when user not found should return error', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(false);
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            await expect(service.validatePayload(payload))
                .rejects.toBeInstanceOf(EntityNotFoundException);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when access token valid should return user', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(false);
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            expect(await service.validatePayload(payload)).toBe(user);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });
    });

    describe('#revokeAccessToken()', () => {
        it('when token revoked should return error', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(true);

            await expect(service.revokeAccessToken(accessToken))
                .rejects.toBeInstanceOf(AccessTokenInvalidException);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
        });

        it('when user not found should return error', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(false);
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            await expect(service.revokeAccessToken(accessToken))
                .rejects.toBeInstanceOf(EntityNotFoundException);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });

        it('when access token valid should return revoked token', async () => {
            revokedTokensService.isTokenRevoked.mockResolvedValue(false);
            revokedTokensService.revokeToken.mockResolvedValue(null);
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            await service.revokeAccessToken(accessToken);

            expect(revokedTokensService.isTokenRevoked.mock.calls[0][0]).toEqual(JTI);
            expect(revokedTokensService.revokeToken.mock.calls[0][0]).toEqual(JTI);
            expect(revokedTokensService.revokeToken.mock.calls[0][1]).toEqual(EXP);
            expect(userRepository.findOne.mock.calls[0][0]).toEqual(USERNAME_QUERY);
        });
    });
});
