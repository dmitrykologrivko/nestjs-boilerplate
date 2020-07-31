import { MockProxy, mock } from 'jest-mock-extended';
import { ValidationContainerException, Ok, Err } from '@nest-boilerplate/core';
import { AuthPasswordController } from '../../controllers/auth-password.controller';
import { UserService } from '../../services/user.service';
import { User } from '../../entities/user.entity';
import { UserFactory } from '../factories/user.factory';

describe('AuthPasswordController', () => {
    const REQUEST = { ip: '0.0.0.0' };
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
            userId: user.id,
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
            userService.changePassword.mockReturnValue(Promise.resolve(Err(new ValidationContainerException([]))));

            await expect(
                controller.changePassword(REQUEST, changePasswordRequest),
            ).rejects.toBeInstanceOf(ValidationContainerException);
        });

        it('when change password successful should return successful response', async () => {
            userService.changePassword.mockReturnValue(Promise.resolve(Ok(null)));

            const result = await controller.changePassword(REQUEST, changePasswordRequest);

            expect(result).toBeNull();
        });
    });

    describe('#forgotPassword()', () => {
        it('when forgot password unsuccessful should throw error', async () => {
            userService.forgotPassword.mockReturnValue(Promise.resolve(Err(new ValidationContainerException([]))));

            await expect(
                controller.forgotPassword(REQUEST, changePasswordRequest),
            ).rejects.toBeInstanceOf(ValidationContainerException);
        });

        it('when forgot password successful should return successful response', async () => {
            userService.forgotPassword.mockReturnValue(Promise.resolve(Ok(null)));

            const result = await controller.forgotPassword(REQUEST, changePasswordRequest);

            expect(result).toBeNull();
        });
    });

    describe('#resetPassword()', () => {
        it('when reset password unsuccessful should throw error', async () => {
            userService.resetPassword.mockReturnValue(Promise.resolve(Err(new ValidationContainerException([]))));

            await expect(
                controller.resetPassword(REQUEST, changePasswordRequest),
            ).rejects.toBeInstanceOf(ValidationContainerException);
        });

        it('when reset password successful should return successful response', async () => {
            userService.resetPassword.mockReturnValue(Promise.resolve(Ok(null)));

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
