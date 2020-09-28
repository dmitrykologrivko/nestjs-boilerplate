import * as request from 'supertest';
import { bootstrapTestingApplication } from '@nestjs-boilerplate/testing';
import { User } from '../src/entities';
import { UserFactory } from '../src/test/user.factory';
import { AuthTestUtils } from '../src/test/auth-test.utils';
import { AppModule } from './src/app.module';
import unauthorizedResponse from './responses/unauthorized.response';
import changePasswordInvalidDataResponse from './responses/change-password-invalid-data.response';
import changePasswordWrongPasswordResponse from './responses/change-password-wrong-password.response';
import forgotPasswordInvalidDataResponse from './responses/forgot-password-invalid-data.response';
import forgotPasswordEmailNotActiveResponse from './responses/forgot-password-email-not-active.response';
import resetPasswordInvalidDataResponse from './responses/reset-password-invalid-data.response';
import resetPasswordTokenInvalidResponse from './responses/reset-password-token-invalid.response';
import validateResetPasswordInvalidDataResponse from './responses/validate-reset-password-token-invalid-data.response';
import validateResetPasswordInvalidTokenResponse from './responses/validate-reset-password-token-invalid-token.response';

describe('AuthPasswordController (e2e)', () => {
    let app;
    let authTestUtils: AuthTestUtils;

    let user: User;
    let jwtAuthHeader: string;

    beforeAll(async () => {
        const bootstrapper = await bootstrapTestingApplication({ module: AppModule });
        app = bootstrapper.container;
        await bootstrapper.init();

        authTestUtils = new AuthTestUtils(app);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        user = await authTestUtils.makeAndSaveUser();
        jwtAuthHeader = await authTestUtils.getJwtAuthHeader(user);
    });

    afterEach(async () => {
        await authTestUtils.clearAllUsers();
    });

    describe('/api/auth/password/change (POST)', () => {
        it('when request is not authorized should return unauthorized error', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/password/change')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when request is invalid should return validation errors', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/password/change')
                .send({})
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(400)
                .expect(changePasswordInvalidDataResponse());
        });

        it('when current password is wrong should return validation error', async () => {
            const req = {
                currentPassword: 'wrong-password',
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/change')
                .send(req)
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(400)
                .expect(changePasswordWrongPasswordResponse({ ...req, userId: user.id }));
        });

        it('when request is valid should return successful response', async () => {
            const req = {
                currentPassword: UserFactory.DEFAULT_PASSWORD,
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/change')
                .send(req)
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(201);
        });
    });

    describe('/api/auth/password/forgot (POST)', () => {
        it('when request is invalid should return validation errors', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/password/forgot')
                .send({})
                .set('Accept', 'application/json')
                .expect(400)
                .expect(forgotPasswordInvalidDataResponse());
        });

        it('when email is not active should return validation error', async () => {
            user.deactivateUser();
            await authTestUtils.saveUser(user);

            const req = {
                email: user.email,
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/forgot')
                .send(req)
                .set('Accept', 'application/json')
                .expect(400)
                .expect(forgotPasswordEmailNotActiveResponse(req));
        });

        it('when request is valid should return successful response', async () => {
            const req = {
                email: user.email,
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/forgot')
                .send(req)
                .set('Accept', 'application/json')
                .expect(201);
        });
    });

    describe('/api/auth/password/reset (POST)', () => {
        it('when request is invalid should return validation errors', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/password/reset')
                .send({})
                .set('Accept', 'application/json')
                .expect(400)
                .expect(resetPasswordInvalidDataResponse());
        });

        it('when reset password token is not valid should return validation error', async () => {
            const req = {
                resetPasswordToken: `${await authTestUtils.generateResetPasswordToken(user)}.wrong`,
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/reset')
                .send(req)
                .set('Accept', 'application/json')
                .expect(400)
                .expect(resetPasswordTokenInvalidResponse(req));
        });

        it('when request is valid should return successful response', async () => {
            const req = {
                resetPasswordToken: await authTestUtils.generateResetPasswordToken(user),
                newPassword: 'new-password',
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/reset')
                .send(req)
                .set('Accept', 'application/json')
                .expect(201);
        });
    });

    describe('/api/auth/password/reset/validate (POST)', () => {
        it('when request is invalid should return validation errors', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/password/reset/validate')
                .send({})
                .set('Accept', 'application/json')
                .expect(400)
                .expect(validateResetPasswordInvalidDataResponse());
        });

        it('when reset password token is not valid should return validation error', async () => {
            const req = {
                resetPasswordToken: `${await authTestUtils.generateResetPasswordToken(user)}.wrong`,
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/reset/validate')
                .send(req)
                .set('Accept', 'application/json')
                .expect(400)
                .expect(validateResetPasswordInvalidTokenResponse(req));
        });

        it('when request is valid should return successful response', async () => {
            const req = {
                resetPasswordToken: await authTestUtils.generateResetPasswordToken(user),
            };

            return request(app.getHttpServer())
                .post('/api/auth/password/reset/validate')
                .send(req)
                .set('Accept', 'application/json')
                .expect(201);
        });
    });
});
