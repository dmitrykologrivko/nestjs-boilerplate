import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    ClassTransformer,
    Ok,
    Err,
    NonFieldValidationException,
} from '@nest-boilerplate/core';
import { AuthService } from '../../services/auth.service';
import { UserPasswordService } from '../../services/user-password.service';
import { CredentialsInvalidException } from '../../exceptions/credentials-invalid.exception';
import { User } from '../../entities/user.entity';
import { ValidateCredentialsInput } from '../../dto/validate-credentials.input';
import { ValidateCredentialsOutput } from '../../dto/validate-credentials.output';
import { UserFactory } from '../user.factory';

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: MockProxy<Repository<User>>;
    let userPasswordService: MockProxy<UserPasswordService> & UserPasswordService;

    let user: User;

    let validateCredentialsInput: ValidateCredentialsInput;
    let validateCredentialsOutput: ValidateCredentialsOutput;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();
        userPasswordService = mock<UserPasswordService>();

        // TODO: https://github.com/marchaos/jest-mock-extended/issues/36
        // @ts-ignore
        service = new AuthService(userRepository, userPasswordService);

        user = await UserFactory.makeUser();

        validateCredentialsInput = {
            username: UserFactory.DEFAULT_USERNAME,
            password: UserFactory.DEFAULT_PASSWORD,
        };
        validateCredentialsOutput = ClassTransformer.toClassObject(ValidateCredentialsOutput, user);
    });

    describe('#validateCredentials()', () => {
        it('when user is not exist should return validation error', async () => {
            userPasswordService.validateCredentials.mockReturnValue(Promise.resolve(Err(new CredentialsInvalidException())));

            const result = await service.validateCredentials(validateCredentialsInput);

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toBeInstanceOf(NonFieldValidationException);
            expect(userPasswordService.validateCredentials.mock.calls[0][0]).toBe(validateCredentialsInput.username);
            expect(userPasswordService.validateCredentials.mock.calls[0][1]).toBe(validateCredentialsInput.password);
        });

        it('when password is wrong should return validation error', async () => {
            const wrongPassword = 'wrong-password';

            userPasswordService.validateCredentials.mockReturnValue(Promise.resolve(Err(new CredentialsInvalidException())));

            const result = await service.validateCredentials({
                ...validateCredentialsInput,
                password: wrongPassword,
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toBeInstanceOf(NonFieldValidationException);
            expect(userPasswordService.validateCredentials.mock.calls[0][0]).toBe(validateCredentialsInput.username);
            expect(userPasswordService.validateCredentials.mock.calls[0][1]).toBe(wrongPassword);
        });

        it('when username and password are correct should successful output', async () => {
            userPasswordService.validateCredentials.mockReturnValue(Promise.resolve(Ok(user)));

            const result = await service.validateCredentials(validateCredentialsInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toStrictEqual(validateCredentialsOutput);
            expect(userPasswordService.validateCredentials.mock.calls[0][0]).toBe(validateCredentialsInput.username);
            expect(userPasswordService.validateCredentials.mock.calls[0][1]).toBe(validateCredentialsInput.password);
        });
    });
});
