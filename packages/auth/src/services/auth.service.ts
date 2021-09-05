import { Repository } from 'typeorm';
import {
    InjectRepository,
    ApplicationService,
    ClassTransformer,
    NonFieldValidationException,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseAuthService } from './base-auth.service';
import { CREDENTIALS_VALID_CONSTRAINT } from '../constants/auth.constraints';
import { User } from '../entities/user.entity';
import { UserPasswordService } from './user-password.service';
import { BaseLoginInput } from '../dto/base-login.input';
import { BaseLoginOutput } from '../dto/base-login.output';
import { BaseLogoutInput } from '../dto/base-logout.input';
import { BaseLogoutOutput } from '../dto/base-logout.output';
import { ValidateCredentialsInput } from '../dto/validate-credentials.input';
import { ValidateCredentialsOutput } from '../dto/validate-credentials.output';

@ApplicationService()
export class AuthService extends BaseAuthService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        private readonly userPasswordService: UserPasswordService,
    ) {
        super(userRepository);
    }

    login(input: BaseLoginInput): Promise<Result<BaseLoginOutput, any>> {
        throw new Error('Method not implemented.');
    }

    logout(input: BaseLogoutInput): Promise<Result<BaseLogoutOutput, any>> {
        throw new Error('Method not implemented.');
    }

    async validateCredentials(
        input: ValidateCredentialsInput
    ): Promise<Result<ValidateCredentialsOutput, NonFieldValidationException>> {
        return (await this.userPasswordService.validateCredentials(input.username, input.password))
            .map(user => ClassTransformer.toClassObject(ValidateCredentialsOutput, user))
            .mapErr(() => (
                new NonFieldValidationException(
                    { [CREDENTIALS_VALID_CONSTRAINT.key]: CREDENTIALS_VALID_CONSTRAINT.message },
                )
            ));
    }
}
