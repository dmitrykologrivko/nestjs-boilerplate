import { UnauthorizedException } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    PropertyConfigService,
    ClassTransformer,
    ValidationException,
} from '@nestjs-boilerplate/core';
import { User, PAYLOAD_VALID_CONSTRAINT } from '@nestjs-boilerplate/user';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { ValidatePayloadOutput } from '../../dto/validate-payload.output';
import { UserFactory } from '../user.factory';

describe('JwtStrategy', () => {
    const JWT_SECRET_KEY = 'qwffs453fsdf5ids78';

    let config: MockProxy<PropertyConfigService> & PropertyConfigService;
    let authService: MockProxy<JwtAuthService> & JwtAuthService;
    let strategy: JwtStrategy;

    let user: User;
    let payload: {
        username: string,
        sub: number,
    };
    let validatePayloadOutput: ValidatePayloadOutput;

    beforeEach(async () => {
        config = mock<PropertyConfigService>();

        config.get.mockReturnValue(JWT_SECRET_KEY);

        authService = mock<JwtAuthService>();
        strategy = new JwtStrategy(config, authService);

        user = await UserFactory.makeUser();

        payload = {
            username: user.username,
            sub: user.id,
        };

        validatePayloadOutput = ClassTransformer.toClassObject(ValidatePayloadOutput, user);
    });

    describe('#validate()', () => {
        it('when user is not exist should throw unauthorized exception', async () => {
            authService.validatePayload.mockReturnValue(Promise.reject(
                new ValidationException(
                    'payload',
                    payload,
                    { [PAYLOAD_VALID_CONSTRAINT.key]: PAYLOAD_VALID_CONSTRAINT.message },
                ),
            ));

            await expect(
                strategy.validate(payload),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('when payload valid should return user', async () => {
            authService.validatePayload.mockReturnValue(Promise.resolve(validatePayloadOutput));

            const result = await strategy.validate(payload);

            expect(result).toBe(validatePayloadOutput);
        });
    });
});
