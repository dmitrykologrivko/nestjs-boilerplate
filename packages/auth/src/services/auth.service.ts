import { Repository } from 'typeorm';
import {
    InjectRepository,
    ApplicationService,
    ClassTransformer,
    NonFieldValidationException,
    AsyncResult,
    Result,
} from '@nestjs-boilerplate/core';
import { BaseAuthService } from './base-auth.service';
import { CREDENTIALS_VALID_CONSTRAINT } from '../constants/auth.constraints';
import { User } from '../entities/user.entity';
import { UserPasswordService } from './user-password.service';
import { ValidateCredentialsInput } from '../dto/validate-credentials.input';
import { ValidateCredentialsOutput } from '../dto/validate-credentials.output';

type ValidateCredentialsResult = Promise<Result<ValidateCredentialsOutput, NonFieldValidationException>>;

@ApplicationService()
export class AuthService extends BaseAuthService {
    constructor(
        @InjectRepository(User)
        protected readonly userRepository: Repository<User>,
        private readonly userPasswordService: UserPasswordService,
    ) {
        super(userRepository);
    }

    async validateCredentials(input: ValidateCredentialsInput): ValidateCredentialsResult {
        return AsyncResult.from(this.userPasswordService.validateCredentials(input.username, input.password))
            .map(user => {
                return ClassTransformer.toClassObject(ValidateCredentialsOutput, user);
            })
            .mapErr(() => (
                new NonFieldValidationException(
                    { [CREDENTIALS_VALID_CONSTRAINT.key]: CREDENTIALS_VALID_CONSTRAINT.message },
                )
            ))
            .toPromise();
    }
}
