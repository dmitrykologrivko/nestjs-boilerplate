import { mock, MockProxy } from 'jest-mock-extended';
import { EventFailedException, PropertyConfigService } from '@nestjs-boilerplate/core';
import { UserChangedPasswordEvent } from '@nestjs-boilerplate/user';
import { UserChangedPasswordEventHandler } from '../../events/user-changed-password-event.handler';
import { BaseRevokedTokensService } from '../../services/base-revoked-tokens.service';
import { UserJwtService } from '../../services/user-jwt.service';

describe('UserChangedPasswordEventHandler', () => {
    let revokedTokensService: MockProxy<BaseRevokedTokensService>;
    let userJwtService: MockProxy<UserJwtService>;
    let config: MockProxy<PropertyConfigService>;

    let handler: UserChangedPasswordEventHandler;

    beforeEach(() => {
        revokedTokensService = mock<BaseRevokedTokensService>();
        userJwtService = mock<UserJwtService>();
        config = mock<PropertyConfigService>();

        handler = new UserChangedPasswordEventHandler(revokedTokensService, userJwtService, config);
    });

    describe('#handle()', () => {
        it('should do nothing if jwt is missing', async () => {
            config.get.mockReturnValue(true);

            const event = new UserChangedPasswordEvent(null, null);

            await expect(handler.handle(event, null)).resolves.toBeNull();

            expect(userJwtService.verifyJwt).not.toHaveBeenCalled();
            expect(revokedTokensService.revokeToken).not.toHaveBeenCalled();
        });

        it('should do nothing if canRevoke is false', async () => {
            config.get.mockReturnValue(false);

            const event = new UserChangedPasswordEvent(null, null);

            await expect(handler.handle(event, null)).resolves.toBeNull();

            expect(userJwtService.verifyJwt).not.toHaveBeenCalled();
            expect(revokedTokensService.revokeToken).not.toHaveBeenCalled();
        });

        it('should throw if canRevoke is true but revokedTokensService is missing', async () => {
            handler = new UserChangedPasswordEventHandler(undefined as any, userJwtService, config);
            config.get.mockReturnValue(true);

            const event = new UserChangedPasswordEvent(1, 'jwt-token');

            await expect(handler.handle(event, null)).rejects.toThrow(EventFailedException);
        });

        it('should revoke token if everything is valid', async () => {
            const token = 'jwt-token';
            const payload = {
                username: 'test-user',
                sub: 123,
                jti: 'jti',
                iat: 123,
                exp: 123,
            };

            config.get.mockReturnValue(true);
            userJwtService.verifyJwt.mockResolvedValue(payload);

            const event = new UserChangedPasswordEvent(1, token);

            await handler.handle(event, null);

            expect(userJwtService.verifyJwt).toHaveBeenCalledWith(token);
            expect(revokedTokensService.revokeToken).toHaveBeenCalledWith(payload.jti, payload.exp);
        });

        it('should throw EventFailedException if verifyJwt throws any error', async () => {
            config.get.mockReturnValue(true);
            userJwtService.verifyJwt.mockRejectedValue(new Error('fail'));

            const event = new UserChangedPasswordEvent(1, 'jwt-token');

            await expect(handler.handle(event, null)).rejects.toThrow(EventFailedException);
        });
    });

    describe('#supports()', () => {
        it('should support UserChangedPasswordEvent', () => {
            expect(handler.supports()).toEqual([UserChangedPasswordEvent.NAME]);
        });
    });
});
