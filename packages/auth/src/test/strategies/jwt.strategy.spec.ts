import { UnauthorizedException } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    PropertyConfigService,
    ClassTransformer,
    ValidationException,
    Ok,
    Err,
} from '@nestjs-boilerplate/core';
import { PAYLOAD_VALID_CONSTRAINT } from '../../constants/auth.constraints';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { JwtAuthService } from '../../services/jwt-auth.service';
import { User } from '../../entities/user.entity';
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
            authService.validatePayload.mockReturnValue(Promise.resolve(Err(
                new ValidationException(
                    'payload',
                    payload,
                    { [PAYLOAD_VALID_CONSTRAINT.key]: PAYLOAD_VALID_CONSTRAINT.message },
                ),
            )));

            await expect(
                strategy.validate(payload),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('when payload valid should return user', async () => {
            authService.validatePayload.mockReturnValue(Promise.resolve(Ok(validatePayloadOutput)));

            const result = await strategy.validate(payload);

            expect(result).toBe(validatePayloadOutput);
        });
    });
});
