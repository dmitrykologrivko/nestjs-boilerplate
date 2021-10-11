import { Repository } from 'typeorm';
import {
    InjectRepository,
    ApplicationService,
    Result,
    ok,
    proceed,
    ClassValidator,
    ClassTransformer,
    ValidationContainerException,
    NonFieldValidationException,
} from '@nestjs-boilerplate/core';
import { CREDENTIALS_VALID_CONSTRAINT } from '@nestjs-boilerplate/user';
import { BaseAuthService } from './base-auth.service';
import { UserJwtService } from './user-jwt.service';
import { User } from '@nestjs-boilerplate/user';
import { JwtLoginInput } from '../dto/jwt-login.input';
import { JwtLoginOutput } from '../dto/jwt-login.output';
import { JwtLogoutInput } from '../dto/jwt-logout.input';
import { JwtLogoutOutput } from '../dto/jwt-logout.output';
import { ValidatePayloadInput } from '../dto/validate-payload.input';
import { ValidatePayloadOutput } from '../dto/validate-payload.output';
import { AccessTokenInvalidException } from '../exceptions/access-token-invalid.exception';

@ApplicationService()
export class JwtAuthService extends BaseAuthService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        private readonly userJwtService: UserJwtService,
    ) {
        super(userRepository);
    }

    async validatePayload(
        input: ValidatePayloadInput,
    ): Promise<Result<ValidatePayloadOutput, AccessTokenInvalidException>> {
        return (await this.userJwtService.validatePayload(input.payload))
            .map(user => ClassTransformer.toClassObject(ValidatePayloadOutput, user))
            .mapErr(() => new AccessTokenInvalidException());
    }

    async login(
        input: JwtLoginInput,
    ): Promise<Result<JwtLoginOutput, ValidationContainerException | NonFieldValidationException>> {
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

    async logout(
        input: JwtLogoutInput,
    ): Promise<Result<JwtLogoutOutput, ValidationContainerException | AccessTokenInvalidException>> {
        return ClassValidator.validate(JwtLogoutInput, input)
            .then(proceed(async () => {
                return (await this.userJwtService.revokeAccessToken(input.token))
                    .map(() => ({}))
                    .mapErr(() => new AccessTokenInvalidException());
            }));
    }
}
