import { MockProxy, mock } from 'jest-mock-extended';
import { ValidationContainerException } from '@nestjs-boilerplate/core';
import { AuthPasswordController } from '../../controllers/auth-password.controller';
import { User, UserService } from '@nestjs-boilerplate/user';
import { UserFactory } from '../user.factory';

describe('AuthPasswordController', () => {
    const REQUEST = {
        ip: '0.0.0.0',
        headers: {
            host: 'localhost',
        },
        protocol: 'http',
    };
    const ACCESS_TOKEN = 'qf3fssf54djfsv78';
    const RESET_PASSWORD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

    let controller: AuthPasswordController;
    let userService: MockProxy<UserService> & UserService;

    let user: User;

    let changePasswordRequest;
    let forgotPasswordRequest;
    let resetPasswordRequest;
    let validateResetPasswordTokenRequest;

    beforeEach(async () => {
        userService = mock<UserService>();
        controller = new AuthPasswordController(userService);

        user = await UserFactory.makeUser();

        changePasswordRequest = {
            currentPassword: UserFactory.DEFAULT_PASSWORD,
            newPassword: 'new-password',
        };

        forgotPasswordRequest = {
            email: user.email,
        };

        resetPasswordRequest = {
            resetPasswordToken: RESET_PASSWORD_TOKEN,
            newPassword: `new${UserFactory.DEFAULT_PASSWORD}`,
        };

        validateResetPasswordTokenRequest = {
            resetPasswordToken: RESET_PASSWORD_TOKEN,
        };
    });

    describe('#changePassword()', () => {
        it('when change password unsuccessful should throw error', async () => {
            userService.changePassword.mockReturnValue(Promise.reject(new ValidationContainerException([])));

            await expect(
                controller.changePassword(REQUEST, user, ACCESS_TOKEN, changePasswordRequest),
            ).rejects.toBeInstanceOf(ValidationContainerException);
        });

        it('when change password successful should return successful response', async () => {
            userService.changePassword.mockReturnValue(Promise.resolve(null));

            const result = await controller.changePassword(REQUEST, user, ACCESS_TOKEN, changePasswordRequest);

            expect(result).toBeNull();
        });
    });

    describe('#forgotPassword()', () => {
        it('when forgot password unsuccessful should throw error', async () => {
            userService.forgotPassword.mockReturnValue(Promise.reject(new ValidationContainerException([])));

            await expect(
                controller.forgotPassword(REQUEST, changePasswordRequest),
            ).rejects.toBeInstanceOf(ValidationContainerException);
        });

        it('when forgot password successful should return successful response', async () => {
            userService.forgotPassword.mockReturnValue(Promise.resolve(null));

            const result = await controller.forgotPassword(REQUEST, changePasswordRequest);

            expect(result).toBeNull();
        });
    });

    describe('#resetPassword()', () => {
        it('when reset password unsuccessful should throw error', async () => {
            userService.resetPassword.mockReturnValue(Promise.reject(new ValidationContainerException([])));

            await expect(
                controller.resetPassword(REQUEST, changePasswordRequest),
            ).rejects.toBeInstanceOf(ValidationContainerException);
        });

        it('when reset password successful should return successful response', async () => {
            userService.resetPassword.mockReturnValue(Promise.resolve(null));

            const result = await controller.resetPassword(REQUEST, changePasswordRequest);

            expect(result).toBeNull();
        });
    });

    describe('#validateResetPasswordToken()', () => {
        it('when validate reset password token successful should return successful response', async () => {
            const result = await controller.validateResetPasswordToken(validateResetPasswordTokenRequest);
            expect(result).toBeUndefined();
        });
    });
});
