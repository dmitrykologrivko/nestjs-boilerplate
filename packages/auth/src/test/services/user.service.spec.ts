import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    ClassTransformer,
    ValidationException,
    ValidationContainerException,
    PropertyConfigService,
    Ok,
} from '@nestjs-boilerplate/core';
import { SimpleIocContainer, createClassValidatorContainer } from '@nestjs-boilerplate/testing';
import { AUTH_PASSWORD_SALT_ROUNDS_PROPERTY } from '../../constants/auth.properties';
import { UserNotFoundException } from '../../exceptions/user-not-found-exception';
import { UserService } from '../../services/user.service';
import { UserVerificationService } from '../../services/user-verification.service';
import { UserPasswordService } from '../../services/user-password.service';
import { UsernameUniqueConstraint } from '../../validation/username-unique.constraint';
import { UsernameExistsConstraint } from '../../validation/username-exists.constraint';
import { EmailUniqueConstraint } from '../../validation/email-unique.constraint';
import { EmailActiveConstraint } from '../../validation/email-active.constraint';
import { PasswordMatchConstraint } from '../../validation/password-match.constraint';
import { ResetPasswordTokenValidConstraint } from '../../validation/reset-password-token-valid.constraint';
import { User } from '../../entities/user.entity';
import { CreateUserInput } from '../../dto/create-user.input';
import { CreateUserOutput } from '../../dto/create-user.output';
import { ChangePasswordInput } from '../../dto/change-password.input';
import { ForceChangePasswordInput } from '../../dto/force-change-password.input';
import { ForgotPasswordInput } from '../../dto/forgot-password.input';
import { ResetPasswordInput } from '../../dto/reset-password.input';
import { FindUserInput } from '../../dto/find-user.input';
import { FindUserOutput } from '../../dto/find-user.output';
import { UserFactory } from '../user.factory';

describe('UserService', () => {
    const USERNAME_QUERY = { where: { _username: UserFactory.DEFAULT_USERNAME } };
    const RESET_PASSWORD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImtleSI6ImQ2ZWNiYTE5ZDM3NjBiZDVj' +
        'NWMwYWQ2MDJmYTYxMjExZWQwNWQxM2M4MmU3ZDM2ZmU5N2JjZDczNjYxYTAyMGUiLCJpYXQiOjE1OTA0MTcwNDYsImV4cCI6M' +
        'TU5MDUwMzQ0Nn0.v8JtgKvH3fk3OEfeBjhtpW_WnJnmvkZF99I0sQ-eV9E';

    let container: SimpleIocContainer;
    let userVerificationService: MockProxy<UserVerificationService> & UserVerificationService;
    let userPasswordService: MockProxy<UserPasswordService> & UserPasswordService;
    let userRepository: MockProxy<Repository<User>>;
    let config: MockProxy<PropertyConfigService> & PropertyConfigService;
    let usernameUniqueConstraint: UsernameUniqueConstraint;
    let usernameExistsConstraint: UsernameExistsConstraint;
    let emailUniqueConstraint: EmailUniqueConstraint;
    let emailActiveConstraint: EmailActiveConstraint;
    let passwordMatchConstraint: PasswordMatchConstraint;
    let resetPasswordTokenValidConstraint: ResetPasswordTokenValidConstraint;
    let service: UserService;

    let user: User;
    let createUserInput: CreateUserInput;
    let createUserOutput: CreateUserOutput;
    let changePasswordInput: ChangePasswordInput;
    let forceChangePasswordInput: ForceChangePasswordInput;
    let forgotPasswordInput: ForgotPasswordInput;
    let resetPasswordInput: ResetPasswordInput;
    let findUserInput: FindUserInput;
    let findUserOutput: FindUserOutput;

    beforeEach(async () => {
        container = createClassValidatorContainer();

        userVerificationService = mock<UserVerificationService>();
        userPasswordService = mock<UserPasswordService>();
        userRepository = mock<Repository<User>>();
        config = mock<PropertyConfigService>();
        usernameUniqueConstraint = new UsernameUniqueConstraint(userVerificationService);
        usernameExistsConstraint = new UsernameExistsConstraint(userVerificationService);
        emailUniqueConstraint = new EmailUniqueConstraint(userVerificationService);
        emailActiveConstraint = new EmailActiveConstraint(userVerificationService);
        passwordMatchConstraint = new PasswordMatchConstraint(userPasswordService);
        resetPasswordTokenValidConstraint = new ResetPasswordTokenValidConstraint(userPasswordService);

        service = new UserService(userRepository, userPasswordService, config);

        container.register(UserVerificationService, userVerificationService, true);
        container.register(UsernameUniqueConstraint, usernameUniqueConstraint);
        container.register(UsernameExistsConstraint, usernameExistsConstraint);
        container.register(EmailUniqueConstraint, emailUniqueConstraint);
        container.register(EmailActiveConstraint, emailActiveConstraint);
        container.register(PasswordMatchConstraint, passwordMatchConstraint);
        container.register(ResetPasswordTokenValidConstraint, resetPasswordTokenValidConstraint);

        user = await UserFactory.makeUser();

        createUserInput = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            password: user.password,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
            isSuperuser: user.isSuperuser,
        };
        createUserOutput = ClassTransformer.toClassObject(CreateUserOutput, user);

        changePasswordInput = {
            userId: user.id,
            currentPassword: UserFactory.DEFAULT_PASSWORD,
            newPassword: `new${UserFactory.DEFAULT_PASSWORD}`,
        };

        forceChangePasswordInput = {
            username: user.username,
            newPassword: `new${UserFactory.DEFAULT_PASSWORD}`,
        };

        forgotPasswordInput = {
            email: user.email,
        };

        resetPasswordInput = {
            resetPasswordToken: RESET_PASSWORD_TOKEN,
            newPassword: `new${UserFactory.DEFAULT_PASSWORD}`,
        };

        findUserInput = { username: user.username };
        findUserOutput = ClassTransformer.toClassObject(FindUserOutput, user);
    });

    describe('#createUser()', () => {
        it('when input is not valid should return validation errors', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'username',
                    null,
                    {
                        isNotEmpty: 'username should not be empty',
                        maxLength: 'username must be shorter than or equal to 150 characters',
                    },
                ),
                new ValidationException(
                    'password',
                    null,
                    {
                        isNotEmpty: 'password should not be empty',
                        minLength: 'password must be longer than or equal to 8 characters',
                        maxLength: 'password must be shorter than or equal to 128 characters',
                    },
                ),
                new ValidationException(
                    'email',
                    null,
                    {
                        isEmail: 'email must be an email',
                        maxLength: 'email must be shorter than or equal to 254 characters',
                    },
                ),
                new ValidationException(
                    'firstName',
                    null,
                    {
                        isNotEmpty: 'firstName should not be empty',
                        maxLength: 'firstName must be shorter than or equal to 30 characters',
                    },
                ),
                new ValidationException(
                    'lastName',
                    null,
                    {
                        isNotEmpty: 'lastName should not be empty',
                        maxLength: 'lastName must be shorter than or equal to 150 characters',
                    },
                ),
            ]);

            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));

            const createUserResult = await service.createUser({
                email: null,
                firstName: null,
                lastName: null,
                username: null,
                password: null,
            });

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(null);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(null);
        });

        it('when email already exists should return validation error', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'email',
                    user.email,
                    {
                        emailUnique: 'User with this email already exists',
                    },
                ),
            ]);

            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(false));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(user.email);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(user.username);
        });

        it('when username already exists should return validation error', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'username',
                    user.username,
                    {
                        usernameUnique: 'User with this username already exists',
                    },
                ),
            ]);

            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(false));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_err()).toBe(true);
            expect(createUserResult.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(user.email);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(user.username);
        });

        it('when input is valid should return successful output', async () => {
            userVerificationService.isEmailUnique.mockReturnValue(Promise.resolve(true));
            userVerificationService.isUsernameUnique.mockReturnValue(Promise.resolve(true));
            userRepository.save.mockReturnValue(Promise.resolve(user));

            const createUserResult = await service.createUser(createUserInput);

            expect(createUserResult.is_ok()).toBe(true);
            expect(createUserResult.unwrap()).toStrictEqual(createUserOutput);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(user.email);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(user.username);

            const callArg = userRepository.save.mock.calls[0][0];

            expect(callArg.username).toBe(user.username);
            expect(callArg.email).toBe(user.email);
            expect(callArg.firstName).toBe(user.firstName);
            expect(callArg.lastName).toBe(user.lastName);
            expect(callArg.isActive).toBe(user.isActive);
            expect(callArg.isAdmin).toBe(user.isAdmin);
            expect(callArg.isSuperuser).toBe(user.isSuperuser);
        });
    });

    describe('#changePassword()', () => {
        it('when input is not valid should return validation errors', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'userId',
                    null,
                    {
                        isDefined: 'userId should not be null or undefined',
                    },
                ),
                new ValidationException(
                    'currentPassword',
                    null,
                    {
                        isNotEmpty: 'currentPassword should not be empty',
                        minLength: 'currentPassword must be longer than or equal to 8 characters',
                        maxLength: 'currentPassword must be shorter than or equal to 128 characters',
                        passwordMatch: 'Does not match with current user password',
                    },
                ),
                new ValidationException(
                    'newPassword',
                    null,
                    {
                        isNotEmpty: 'newPassword should not be empty',
                        minLength: 'newPassword must be longer than or equal to 8 characters',
                        maxLength: 'newPassword must be shorter than or equal to 128 characters',
                    },
                ),
            ]);

            userPasswordService.comparePassword.mockReturnValue(Promise.resolve(false));

            const result = await service.changePassword({
                userId: null,
                currentPassword: null,
                newPassword: null,
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);

            expect(userPasswordService.comparePassword.mock.calls.length).toBe(0);
        });

        it('when current password is wrong should return validation error', async () => {
            const wrongPassword = 'wrong-password';
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'currentPassword',
                    wrongPassword,
                    {
                        passwordMatch: 'Does not match with current user password',
                    },
                ),
            ]);

            userPasswordService.comparePassword.mockReturnValue(Promise.resolve(false));

            const result = await service.changePassword({
                ...changePasswordInput,
                currentPassword: wrongPassword,
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);

            expect(userPasswordService.comparePassword.mock.calls[0][0]).toBe(user.id);
            expect(userPasswordService.comparePassword.mock.calls[0][1]).toBe(wrongPassword);
        });

        it('when input is valid should change password', async () => {
            config.get.mockReturnValue(10);
            userPasswordService.comparePassword.mockReturnValue(Promise.resolve(true));
            userRepository.findOne.mockReturnValue(Promise.resolve(user));
            userRepository.save.mockReturnValue(Promise.resolve(user));

            expect(await user.comparePassword(changePasswordInput.currentPassword)).toBeTruthy();

            const result = await service.changePassword(changePasswordInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toBeNull();

            expect(await user.comparePassword(changePasswordInput.newPassword)).toBeTruthy();

            expect(config.get.mock.calls[0][0])
                .toBe(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY);
            expect(userPasswordService.comparePassword.mock.calls[0][0])
                .toBe(user.id);
            expect(userPasswordService.comparePassword.mock.calls[0][1])
                .toBe(UserFactory.DEFAULT_PASSWORD);
            expect(userRepository.findOne.mock.calls[0][0])
                .toBe(user.id);
            expect(userRepository.save.mock.calls[0][0])
                .toBe(user);
        });
    });

    describe('#forceChangePassword()', () => {
        it('when input is not valid should return validation errors', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'username',
                    null,
                    {
                        isDefined: 'username should not be null or undefined',
                        usernameExists: 'User with this username does not exist',
                    },
                ),
                new ValidationException(
                    'newPassword',
                    null,
                    {
                        isNotEmpty: 'newPassword should not be empty',
                        minLength: 'newPassword must be longer than or equal to 8 characters',
                        maxLength: 'newPassword must be shorter than or equal to 128 characters',
                    },
                ),
            ]);

            userVerificationService.isUsernameExists.mockReturnValue(Promise.resolve(false));

            const result = await service.forceChangePassword({
                username: null,
                newPassword: null,
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);
        });

        it('when username does not exist should return validation errors', async () => {
            const wrongUsername = 'wrong-username';
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'username',
                    wrongUsername,
                    {
                        usernameExists: 'User with this username does not exist',
                    },
                ),
            ]);

            userVerificationService.isUsernameExists.mockReturnValue(Promise.resolve(false));

            const result = await service.forceChangePassword({
                username: wrongUsername,
                newPassword: 'new-password',
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isUsernameExists.mock.calls[0][0]).toBe(wrongUsername);
        });

        it('when input is valid should change password', async () => {
            config.get.mockReturnValue(10);
            userVerificationService.isUsernameExists.mockReturnValue(Promise.resolve(true));
            userRepository.findOne.mockReturnValue(Promise.resolve(user));
            userRepository.save.mockReturnValue(Promise.resolve(user));

            expect(await user.comparePassword(UserFactory.DEFAULT_PASSWORD)).toBeTruthy();

            const result = await service.forceChangePassword(forceChangePasswordInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toBeNull();

            expect(await user.comparePassword(forceChangePasswordInput.newPassword)).toBeTruthy();

            expect(config.get.mock.calls[0][0])
                .toBe(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY);
            expect(userVerificationService.isUsernameExists.mock.calls[0][0])
                .toBe(user.username);
            expect(userRepository.findOne.mock.calls[0][0])
                .toStrictEqual(USERNAME_QUERY);
            expect(userRepository.save.mock.calls[0][0])
                .toBe(user);
        });
    });

    describe('#forgotPassword()', () => {
        it('when input is not valid should return validation errors', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'email',
                    null,
                    {
                        emailActive: 'Email is not found',
                        isEmail: 'email must be an email',
                    },
                ),
            ]);

            userVerificationService.isEmailActive.mockReturnValue(Promise.resolve(false));

            const result = await service.forgotPassword({ email: null });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);
        });

        it('when email is not active should return validation errors', async () => {
            const wrongEmail = 'wrong-email@email.com';
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'email',
                    wrongEmail,
                    {
                        emailActive: 'Email is not found',
                    },
                ),
            ]);

            userVerificationService.isEmailActive.mockReturnValue(Promise.resolve(false));

            const result = await service.forgotPassword({ email: wrongEmail });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);

            expect(userVerificationService.isEmailActive.mock.calls[0][0]).toBe(wrongEmail);
        });

        // TODO: Check sending emails
        it.skip('when input is valid should send reset password email', async () => {
            userVerificationService.isEmailActive.mockReturnValue(Promise.resolve(true));
            userRepository.findOne.mockReturnValue(Promise.resolve(user));
            userPasswordService.generateResetPasswordToken.mockReturnValue(Promise.resolve(RESET_PASSWORD_TOKEN));

            const result = await service.forgotPassword(forgotPasswordInput);

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toBeNull();

            expect(userVerificationService.isEmailActive.mock.calls[0][0]).toBe(forgotPasswordInput.email);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual({
                where: { _email: forgotPasswordInput.email },
            });
            expect(userPasswordService.generateResetPasswordToken.mock.calls[0][0]).toBe(user);
        });
    });

    describe('#resetPassword()', () => {
        it('when input is not valid should return validation error', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'resetPasswordToken',
                    null,
                    {
                        isJwt: 'resetPasswordToken must be a jwt string',
                        resetPasswordTokenValid: 'Reset password token is not valid',
                    },
                ),
                new ValidationException(
                    'newPassword',
                    null,
                    {
                        isNotEmpty: 'newPassword should not be empty',
                        minLength: 'newPassword must be longer than or equal to 8 characters',
                        maxLength: 'newPassword must be shorter than or equal to 128 characters',
                    },
                ),
            ]);

            userPasswordService.isResetPasswordTokenValid.mockReturnValue(Promise.resolve(false));

            const result = await service.resetPassword({
                resetPasswordToken: null,
                newPassword: null,
            });

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);
        });

        it('when reset password token is not valid should return validation error', async () => {
            const errors: ValidationContainerException = new ValidationContainerException([
                new ValidationException(
                    'resetPasswordToken',
                    resetPasswordInput.resetPasswordToken,
                    {
                        resetPasswordTokenValid: 'Reset password token is not valid',
                    },
                ),
            ]);

            userPasswordService.isResetPasswordTokenValid.mockReturnValue(Promise.resolve(false));

            const result = await service.resetPassword(resetPasswordInput);

            expect(result.is_err()).toBe(true);
            expect(result.unwrap_err()).toStrictEqual(errors);
        });

        it('when input is valid should reset password', async () => {
            config.get.mockReturnValue(10);
            userPasswordService.isResetPasswordTokenValid.mockReturnValue(Promise.resolve(true));
            userPasswordService.validateResetPasswordToken.mockReturnValue(Promise.resolve(Ok(user)));
            userRepository.save.mockReturnValue(Promise.resolve(user));

            expect(await user.comparePassword(UserFactory.DEFAULT_PASSWORD)).toBeTruthy();

            const result = await service.resetPassword(resetPasswordInput);

            expect(await user.comparePassword(resetPasswordInput.newPassword)).toBeTruthy();

            expect(result.is_ok()).toBe(true);
            expect(result.unwrap()).toBeNull();

            expect(config.get.mock.calls[0][0])
                .toBe(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY);
            expect(userPasswordService.isResetPasswordTokenValid.mock.calls[0][0])
                .toBe(resetPasswordInput.resetPasswordToken);
            expect(userPasswordService.validateResetPasswordToken.mock.calls[0][0])
                .toBe(resetPasswordInput.resetPasswordToken);
            expect(userRepository.save.mock.calls[0][0])
                .toBe(user);
        });
    });

    describe('#findUser()', () => {
        it('when user is not exist should return not found error', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(null));

            const findUserResult = await service.findUser(findUserInput);

            expect(findUserResult.is_err()).toBe(true);
            expect(findUserResult.unwrap_err()).toBeInstanceOf(UserNotFoundException);

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when user exists should return successful output', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const findUserResult = await service.findUser(findUserInput);

            expect(findUserResult.is_ok()).toBe(true);
            expect(findUserResult.unwrap()).toStrictEqual(findUserOutput);

            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });
    });
});
