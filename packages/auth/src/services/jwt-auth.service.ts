import { Repository } from 'typeorm';
import {
    InjectRepository,
    ApplicationService,
    PropertyConfigService,
    Result,
    ok,
    proceed,
    ClassValidator,
    ClassTransformer,
    ValidationContainerException,
    NonFieldValidationException,
} from '@nestjs-boilerplate/core';
import { User, CREDENTIALS_VALID_CONSTRAINT } from '@nestjs-boilerplate/user';
import { AUTH_JWT_REVOKE_AFTER_LOGOUT_PROPERTY } from '../constants/auth.properties';
import { BaseAuthService } from './base-auth.service';
import { UserJwtService } from './user-jwt.service';
import { JwtLoginInput } from '../dto/jwt-login.input';
import { JwtLoginOutput } from '../dto/jwt-login.output';
import { JwtLogoutInput } from '../dto/jwt-logout.input';
import { JwtLogoutOutput } from '../dto/jwt-logout.output';
import { ValidatePayloadInput } from '../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../dto/validate-payload.output';
import { AccessTokenInvalidException } from '../exceptions/access-token-invalid.exception';
import { RevokedTokensServiceNotConfiguredException } from '../exceptions/revoked-tokens-service-not-configured.exception';

type ValidatePayloadResult = Promise<Result<ValidatePayloadOutput, AccessTokenInvalidException>>;

type LoginResult = Promise<Result<JwtLoginOutput, ValidationContainerException | NonFieldValidationException>>;

type LogoutResult = Promise<Result<JwtLogoutOutput, ValidationContainerException
    | AccessTokenInvalidException
    | RevokedTokensServiceNotConfiguredException>>;

@ApplicationService()
export class JwtAuthService extends BaseAuthService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        private readonly userJwtService: UserJwtService,
        private readonly config: PropertyConfigService,
    ) {
        super(userRepository);
    }

    async validatePayload(input: ValidatePayloadInput): ValidatePayloadResult {
        return (await this.userJwtService.validatePayload(input.payload))
            .map(user => ClassTransformer.toClassObject(ValidatePayloadOutput, user))
            .mapErr(() => new AccessTokenInvalidException());
    }

    async login(input: JwtLoginInput): LoginResult {
        return ClassValidator.validate(JwtLoginInput, input)
            .then(proceed(async () => {
                return (await this.userJwtService.generateAccessToken(input.username, input.password))
                    .map(accessToken => ({ accessToken }))
                    .mapErr(() => {
                        return new NonFieldValidationException({
                            [CREDENTIALS_VALID_CONSTRAINT.key]: CREDENTIALS_VALID_CONSTRAINT.message
                        });
                    });
            }));
    }

    async logout(input: JwtLogoutInput): LogoutResult {
        return ClassValidator.validate(JwtLogoutInput, input)
            .then(proceed(async () => {
                if (!this.config.get(AUTH_JWT_REVOKE_AFTER_LOGOUT_PROPERTY)) {
                    return ok(null);
                }

                return (await this.userJwtService.revokeAccessToken(input.token))
                    .map(() => ({}))
                    .mapErr(error => {
                        return error instanceof RevokedTokensServiceNotConfiguredException
                            ? error
                            : new AccessTokenInvalidException();
                    });
            }));
    }
}
