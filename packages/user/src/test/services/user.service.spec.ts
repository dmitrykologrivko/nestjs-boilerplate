import {
    Repository,
    DataSource,
    QueryRunner,
    EntityManager,
} from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    ClassTransformer,
    ValidationException,
    ValidationContainerException,
    PropertyConfigService,
    BaseMailService,
    BaseTemplateService,
    EventBus,
} from '@nestjs-boilerplate/core';
import { SimpleIocContainer, createClassValidatorContainer } from '@nestjs-boilerplate/testing';
import { USER_PASSWORD_SALT_ROUNDS_PROPERTY } from '../../constants/user.properties';
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
import { UserChangedPasswordEvent } from '../../events/user-changed-password.event';
import { UserRecoveredPasswordEvent } from '../../events/user-recovered-password.event';
import { UserFactory } from '../user.factory';

describe('UserService', () => {
    const USERNAME_QUERY = { where: { username: UserFactory.DEFAULT_USERNAME, isActive: true } };
    const RESET_PASSWORD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImtleSI6ImQ2ZWNiYTE5ZDM3NjBiZDVj' +
        'NWMwYWQ2MDJmYTYxMjExZWQwNWQxM2M4MmU3ZDM2ZmU5N2JjZDczNjYxYTAyMGUiLCJpYXQiOjE1OTA0MTcwNDYsImV4cCI6M' +
        'TU5MDUwMzQ0Nn0.v8JtgKvH3fk3OEfeBjhtpW_WnJnmvkZF99I0sQ-eV9E';

    let container: SimpleIocContainer;
    let entityManager: MockProxy<EntityManager>;
    let connection: MockProxy<DataSource>;
    let userVerificationService: MockProxy<UserVerificationService> & UserVerificationService;
    let userPasswordService: MockProxy<UserPasswordService> & UserPasswordService;
    let userRepository: MockProxy<Repository<User>>;
    let mailService: MockProxy<BaseMailService>;
    let templateService: MockProxy<BaseTemplateService>;
    let config: MockProxy<PropertyConfigService> & PropertyConfigService;
    let eventBus: MockProxy<EventBus>;
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

    beforeEach(async () => {
        container = createClassValidatorContainer();

        entityManager = mock<EntityManager>();
        connection = mock<DataSource>({
            createQueryRunner(mode): QueryRunner {
                return mock<QueryRunner>({
                    manager: entityManager,
                });
            }
        });
        userVerificationService = mock<UserVerificationService>();
        userPasswordService = mock<UserPasswordService>();
        userRepository = mock<Repository<User>>();
        mailService = mock<BaseMailService>();
        templateService = mock<BaseTemplateService>();
        config = mock<PropertyConfigService>();
        eventBus = mock<EventBus>();
        usernameUniqueConstraint = new UsernameUniqueConstraint(userVerificationService);
        usernameExistsConstraint = new UsernameExistsConstraint(userVerificationService);
        emailUniqueConstraint = new EmailUniqueConstraint(userVerificationService);
        emailActiveConstraint = new EmailActiveConstraint(userVerificationService);
        passwordMatchConstraint = new PasswordMatchConstraint(userPasswordService);
        resetPasswordTokenValidConstraint = new ResetPasswordTokenValidConstraint(userPasswordService);

        service = new UserService(
            connection,
            userRepository,
            userPasswordService,
            mailService,
            templateService,
            config,
            eventBus,
        );

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
            host: 'localhost',
            protocol: 'http',
        };

        resetPasswordInput = {
            resetPasswordToken: RESET_PASSWORD_TOKEN,
            newPassword: `new${UserFactory.DEFAULT_PASSWORD}`,
        };
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

            userVerificationService.isEmailUnique.mockResolvedValue(true);
            userVerificationService.isUsernameUnique.mockResolvedValue(true);

            await expect(service.createUser({
                email: null,
                firstName: null,
                lastName: null,
                username: null,
                password: null,
            })).rejects.toStrictEqual(errors);

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

            userVerificationService.isEmailUnique.mockResolvedValue(false);
            userVerificationService.isUsernameUnique.mockResolvedValue(true);

            await expect(service.createUser(createUserInput)).rejects.toStrictEqual(errors);

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

            userVerificationService.isEmailUnique.mockResolvedValue(true);
            userVerificationService.isUsernameUnique.mockResolvedValue(false);

            await expect(service.createUser(createUserInput)).rejects.toStrictEqual(errors);

            expect(userVerificationService.isEmailUnique.mock.calls[0][0]).toBe(user.email);
            expect(userVerificationService.isUsernameUnique.mock.calls[0][0]).toBe(user.username);
        });

        it('when input is valid should return successful output', async () => {
            userVerificationService.isEmailUnique.mockResolvedValue(true);
            userVerificationService.isUsernameUnique.mockResolvedValue(true);
            userRepository.save.mockResolvedValue(user);

            expect(await service.createUser(createUserInput)).toStrictEqual(createUserOutput);

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

            userPasswordService.comparePassword.mockResolvedValue(false);

            await expect(service.changePassword({
                userId: null,
                currentPassword: null,
                newPassword: null,
            })).rejects.toStrictEqual(errors);

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

            userPasswordService.comparePassword.mockResolvedValue(false);

            await expect(service.changePassword({
                ...changePasswordInput,
                currentPassword: wrongPassword,
            })).rejects.toStrictEqual(errors);

            expect(userPasswordService.comparePassword.mock.calls[0][0]).toBe(user.id);
            expect(userPasswordService.comparePassword.mock.calls[0][1]).toBe(wrongPassword);
        });

        it('when input is valid should change password', async () => {
            config.get.mockReturnValue(10);
            userPasswordService.comparePassword.mockResolvedValue(true);
            entityManager.findOne.mockResolvedValue(user);
            entityManager.save.mockResolvedValue(user);

            expect(await user.comparePassword(changePasswordInput.currentPassword)).toBeTruthy();

            await service.changePassword(changePasswordInput);

            expect(await user.comparePassword(changePasswordInput.newPassword)).toBeTruthy();

            expect(config.get.mock.calls[0][0])
                .toBe(USER_PASSWORD_SALT_ROUNDS_PROPERTY);
            expect(userPasswordService.comparePassword.mock.calls[0][0])
                .toBe(user.id);
            expect(userPasswordService.comparePassword.mock.calls[0][1])
                .toBe(UserFactory.DEFAULT_PASSWORD);
            expect(entityManager.findOne.mock.calls[0][0])
                .toStrictEqual(User);
            expect(entityManager.findOne.mock.calls[0][1])
                .toStrictEqual({
                    where: {
                        id: user.id,
                        isActive: true,
                    },
                });
            expect(entityManager.save.mock.calls[0][0])
                .toBe(user);
            expect(eventBus.publish.mock.calls[0][0])
                .toBeInstanceOf(UserChangedPasswordEvent);
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

            userVerificationService.isUsernameExists.mockResolvedValue(false);

            await expect(service.forceChangePassword({
                username: null,
                newPassword: null,
            })).rejects.toStrictEqual(errors);
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

            userVerificationService.isUsernameExists.mockResolvedValue(false);

            await expect(service.forceChangePassword({
                username: wrongUsername,
                newPassword: 'new-password',
            })).rejects.toStrictEqual(errors);

            expect(userVerificationService.isUsernameExists.mock.calls[0][0]).toBe(wrongUsername);
        });

        it('when input is valid should change password', async () => {
            config.get.mockReturnValue(10);
            userVerificationService.isUsernameExists.mockResolvedValue(true);
            entityManager.findOne.mockResolvedValue(user);
            entityManager.save.mockResolvedValue(user);

            expect(await user.comparePassword(UserFactory.DEFAULT_PASSWORD)).toBeTruthy();

            await service.forceChangePassword(forceChangePasswordInput);

            expect(await user.comparePassword(forceChangePasswordInput.newPassword)).toBeTruthy();

            expect(config.get.mock.calls[0][0])
                .toBe(USER_PASSWORD_SALT_ROUNDS_PROPERTY);
            expect(userVerificationService.isUsernameExists.mock.calls[0][0])
                .toBe(user.username);
            expect(entityManager.findOne.mock.calls[0][0])
                .toStrictEqual(User);
            expect(entityManager.findOne.mock.calls[0][1])
                .toStrictEqual(USERNAME_QUERY);
            expect(entityManager.save.mock.calls[0][0])
                .toBe(user);
            expect(eventBus.publish.mock.calls[0][0])
                .toBeInstanceOf(UserChangedPasswordEvent);
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
                new ValidationException(
                    'host',
                    null,
                    {
                        isNotEmpty: 'host should not be empty',
                    },
                ),
                new ValidationException(
                    'protocol',
                    null,
                    {
                        isNotEmpty: 'protocol should not be empty',
                    },
                ),
            ]);

            userVerificationService.isEmailActive.mockResolvedValue(false);

            await expect(service.forgotPassword({
                email: null,
                host: null,
                protocol: null,
            })).rejects.toStrictEqual(errors);
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

            userVerificationService.isEmailActive.mockResolvedValue(false);

            await expect(service.forgotPassword({
                email: wrongEmail,
                host: 'localhost',
                protocol: 'http',
            })).rejects.toStrictEqual(errors);

            expect(userVerificationService.isEmailActive.mock.calls[0][0]).toBe(wrongEmail);
        });

        it('when input is valid should send reset password email', async () => {
            const MAIL_CONFIG = {
                defaultFrom: 'noreplay@test.com',
            };
            const AUTH_CONFIG = {
                password: {
                    resetMailSubject: 'Reset Password',
                    resetMailTemplate: 'auth__reset_password.html',
                },
            };
            const HTML_CONTENT = `
                <html>
                    <body>
                        https://test.com/reset-password?token=${RESET_PASSWORD_TOKEN}
                    </body>
                </html>
            `;

            userVerificationService.isEmailActive.mockResolvedValue(true);
            userRepository.findOne.mockResolvedValue(user);
            userPasswordService.generateResetPasswordToken.mockResolvedValue(RESET_PASSWORD_TOKEN);
            templateService.render.mockResolvedValue(HTML_CONTENT);
            config.get.mockReturnValueOnce(MAIL_CONFIG).mockReturnValueOnce(AUTH_CONFIG);

            await service.forgotPassword(forgotPasswordInput);

            expect(userVerificationService.isEmailActive.mock.calls[0][0]).toBe(forgotPasswordInput.email);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual({
                where: { email: forgotPasswordInput.email, isActive: true },
            });
            expect(userPasswordService.generateResetPasswordToken.mock.calls[0][0]).toBe(user);
            expect(templateService.render.mock.calls[0][0]).toBe(AUTH_CONFIG.password.resetMailTemplate);
            expect(templateService.render.mock.calls[0][1]).toStrictEqual({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                host: forgotPasswordInput.host,
                protocol: forgotPasswordInput.protocol,
                token: RESET_PASSWORD_TOKEN,
            });
            expect(mailService.sendMail.mock.calls[0][0]).toStrictEqual({
                subject: AUTH_CONFIG.password.resetMailSubject,
                to: [user.email],
                from: MAIL_CONFIG.defaultFrom,
                text: '',
                html: HTML_CONTENT,
            });
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

            userPasswordService.isResetPasswordTokenValid.mockResolvedValue(false);

            await expect(service.resetPassword({
                resetPasswordToken: null,
                newPassword: null,
            })).rejects.toStrictEqual(errors);
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

            userPasswordService.isResetPasswordTokenValid.mockResolvedValue(false);

            await expect(service.resetPassword(resetPasswordInput)).rejects.toStrictEqual(errors);
        });

        it('when input is valid should reset password', async () => {
            config.get.mockReturnValue(10);
            userPasswordService.isResetPasswordTokenValid.mockResolvedValue(true);
            userPasswordService.validateResetPasswordToken.mockResolvedValue(user);
            entityManager.save.mockResolvedValue(user);

            expect(await user.comparePassword(UserFactory.DEFAULT_PASSWORD)).toBeTruthy();

            await service.resetPassword(resetPasswordInput);

            expect(await user.comparePassword(resetPasswordInput.newPassword)).toBeTruthy();

            expect(config.get.mock.calls[0][0])
                .toBe(USER_PASSWORD_SALT_ROUNDS_PROPERTY);
            expect(userPasswordService.isResetPasswordTokenValid.mock.calls[0][0])
                .toBe(resetPasswordInput.resetPasswordToken);
            expect(userPasswordService.validateResetPasswordToken.mock.calls[0][0])
                .toBe(resetPasswordInput.resetPasswordToken);
            expect(entityManager.save.mock.calls[0][0])
                .toBe(user);
            expect(eventBus.publish.mock.calls[0][0])
                .toBeInstanceOf(UserRecoveredPasswordEvent);
        });
    });
});
