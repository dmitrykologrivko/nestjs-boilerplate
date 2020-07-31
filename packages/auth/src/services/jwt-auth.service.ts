import { Repository } from 'typeorm';
import {
    InjectRepository,
    ApplicationService,
    Result,
    Ok,
    AsyncResult,
    ClassTransformer,
    ValidationException,
} from '@nest-boilerplate/core';
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

type ValidatePayloadResult = Promise<Result<ValidatePayloadOutput, ValidationException>>;
type LoginResult = Promise<Result<JwtLoginOutput, ValidationException>>;
type LogoutResult = Promise<Result<JwtLogoutOutput, ValidationException>>;

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

    async validatePayload(input: ValidatePayloadInput): ValidatePayloadResult {
        return AsyncResult.from(this.userJwtService.validatePayload(input.payload))
            .map(user => {
                return ClassTransformer.toClassObject(ValidatePayloadOutput, user);
            })
            .map_err(() => (
                new ValidationException(
                    'payload',
                    input.payload,
                    { [PAYLOAD_VALID_CONSTRAINT.key]: PAYLOAD_VALID_CONSTRAINT.message },
                )
            ))
            .toResult();
    }

    async login(input: JwtLoginInput): LoginResult {
        return AsyncResult.from(this.userJwtService.generateAccessToken(input.username))
            .map(token => ({ accessToken: token }))
            .map_err(() => (
                new ValidationException(
                    'username',
                    input.username,
                    { [USERNAME_ACTIVE_CONSTRAINT.key]: USERNAME_ACTIVE_CONSTRAINT.message },
                )
            ))
            .toResult();
    }

    async logout(input: JwtLogoutInput): LogoutResult {
        return AsyncResult.from(this.userJwtService.revokeAccessToken(input.token))
            .and_then(async revokedToken => {
                await this.revokedTokenRepository.save(revokedToken);
                return Ok({});
            })
            .map_err(() => (
                 new ValidationException(
                    'token',
                    input.token,
                    { [JWT_TOKEN_VALID_CONSTRAINT.key]: JWT_TOKEN_VALID_CONSTRAINT.message },
                )
            ))
            .toResult();
    }
}
