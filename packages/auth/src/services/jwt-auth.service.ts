import { Repository } from 'typeorm';
import {
    InjectRepository,
    ApplicationService,
    PropertyConfigService,
    ClassValidator,
    ClassTransformer,
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

    /**
     * Validate the payload of the JWT token
     * @param input
     * @throws AccessTokenInvalidException
     */
    async validatePayload(input: ValidatePayloadInput): Promise<ValidatePayloadOutput> {
        try {
            const user = await this.userJwtService.validatePayload(input.payload);
            return ClassTransformer.toClassObject(ValidatePayloadOutput, user);
        } catch (_) {
            throw new AccessTokenInvalidException();
        }
    }

    /**
     * Generate a new access token for the user
     * @param input
     * @throws ValidationContainerException
     * @throws NonFieldValidationException
     */
    async login(input: JwtLoginInput): Promise<JwtLoginOutput> {
        await ClassValidator.validate(JwtLoginInput, input);

        try {
            const accessToken = await this.userJwtService.generateAccessToken(input.username, input.password);
            return {
                accessToken,
            };
        } catch (_) {
            throw new NonFieldValidationException({
                [CREDENTIALS_VALID_CONSTRAINT.key]: CREDENTIALS_VALID_CONSTRAINT.message
            });
        }
    }

    /**
     * Logout the user by revoking the access token
     * @param input
     * @throws ValidationContainerException
     * @throws AccessTokenInvalidException
     * @throws RevokedTokensServiceNotConfiguredException
     */
    async logout(input: JwtLogoutInput): Promise<JwtLogoutOutput> {
        await ClassValidator.validate(JwtLogoutInput, input);

        if (!this.config.get(AUTH_JWT_REVOKE_AFTER_LOGOUT_PROPERTY)) {
            return null;
        }

        try {
            await this.userJwtService.revokeAccessToken(input.token);
            return {};
        } catch (e) {
            if (e instanceof RevokedTokensServiceNotConfiguredException) {
                throw e;
            }
            throw new AccessTokenInvalidException();
        }
    }
}
