import { Repository } from 'typeorm';
import {
    InjectRepository,
    ApplicationService,
    Result,
    ok,
    proceed,
    ClassTransformer,
    ValidationException,
} from '@nestjs-boilerplate/core';
import { BaseAuthService } from './base-auth.service';
import { UserJwtService } from './user-jwt.service';
import {
    PAYLOAD_VALID_CONSTRAINT,
    JWT_TOKEN_VALID_CONSTRAINT,
    USERNAME_ACTIVE_CONSTRAINT,
} from '../constants/auth.constraints';
import { User } from '../entities/user.entity';
import { RevokedToken } from '../entities/revoked-token.entity';
import { JwtLoginInput } from '../dto/jwt-login.input';
import { JwtLoginOutput } from '../dto/jwt-login.output';
import { JwtLogoutInput } from '../dto/jwt-logout.input';
import { JwtLogoutOutput } from '../dto/jwt-logout.output';
import { ValidatePayloadInput } from '../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../dto/validate-payload.output';

@ApplicationService()
export class JwtAuthService extends BaseAuthService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        @InjectRepository(RevokedToken)
        protected readonly revokedTokenRepository: Repository<RevokedToken>,
        private readonly userJwtService: UserJwtService,
    ) {
        super(userRepository);
    }

    async validatePayload(
        input: ValidatePayloadInput,
    ): Promise<Result<ValidatePayloadOutput, ValidationException>> {
        return (await this.userJwtService.validatePayload(input.payload))
            .map(user => ClassTransformer.toClassObject(ValidatePayloadOutput, user))
            .mapErr(() => (
                new ValidationException(
                    'payload',
                    input.payload,
                    { [PAYLOAD_VALID_CONSTRAINT.key]: PAYLOAD_VALID_CONSTRAINT.message },
                )
            ));
    }

    async login(
        input: JwtLoginInput,
    ): Promise<Result<JwtLoginOutput, ValidationException>> {
        return (await this.userJwtService.generateAccessToken(input.username))
            .map(accessToken => ({ accessToken }))
            .mapErr(() => (
                new ValidationException(
                    'username',
                    input.username,
                    { [USERNAME_ACTIVE_CONSTRAINT.key]: USERNAME_ACTIVE_CONSTRAINT.message },
                )
            ));
    }

    async logout(
        input: JwtLogoutInput,
    ): Promise<Result<JwtLogoutOutput, ValidationException>> {
        return (await this.userJwtService.revokeAccessToken(input.token)
            .then(proceed(async revokedToken => {
                await this.revokedTokenRepository.save(revokedToken);
                return ok({});
            })))
            .mapErr(() => (
                new ValidationException(
                    'token',
                    input.token,
                    { [JWT_TOKEN_VALID_CONSTRAINT.key]: JWT_TOKEN_VALID_CONSTRAINT.message },
                )
            ));
    }
}
