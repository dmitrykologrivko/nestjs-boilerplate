import * as request from 'supertest';
import { TestBootstrap } from '@nestjs-boilerplate/testing';
import { User } from '@nestjs-boilerplate/user';
import { BaseRevokedTokensService } from '../src/services/base-revoked-tokens.service';
import { RevokedTokensService } from '../src/test/revoked-tokens.service';
import { UserFactory } from '../src/test/user.factory';
import { AuthTestUtils } from '../src/test/auth-test.utils';
import { AppModule } from './src/app.module';
import unauthorizedResponse from './responses/unauthorized.response';
import loginInvalidCredentialsResponse from './responses/login-invalid-credentials';

describe('AuthJwtController (e2e)', () => {
    let app;
    let authTestUtils: AuthTestUtils;

    beforeAll(async () => {
        app = await new TestBootstrap(AppModule)
            .startApplication({
                onCreateTestingModule(builder) {
                    return builder.overrideProvider(BaseRevokedTokensService)
                        .useValue(new RevokedTokensService());
                }
            });
        authTestUtils = new AuthTestUtils(app);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await authTestUtils.clearAllUsers();
    });

    describe('/api/auth/jwt/login (POST)', () => {
        it('when user not exist should return validation error', () => {
            return request(app.getHttpServer())
                .post('/api/auth/jwt/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(400)
                .expect(loginInvalidCredentialsResponse);
        });

        it('when user is inactive should return validation error', async () => {
            const user = await authTestUtils.makeAndSaveUser();
            user.deactivateUser();
            await authTestUtils.saveUser(user);

            return request(app.getHttpServer())
                .post('/api/auth/jwt/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(400)
                .expect(loginInvalidCredentialsResponse);
        });

        it('when wrong password is provided should return validation error', async () => {
            await authTestUtils.makeAndSaveUser();

            return request(app.getHttpServer())
                .post('/api/auth/jwt/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: 'some-wrong-password',
                })
                .set('Accept', 'application/json')
                .expect(400)
                .expect(loginInvalidCredentialsResponse);
        });

        it('when username and password are correct should return access token', async () => {
            await authTestUtils.makeAndSaveUser();

            return request(app.getHttpServer())
                .post('/api/auth/jwt/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(201)
                .then(res => {
                    expect(res.body.accessToken).toBeDefined();
                });
        });
    });

    describe('/api/auth/jwt/logout (POST)', () => {
        let user: User;
        let accessToken: string;
        let jwtAuthHeader: string;

        beforeEach(async () => {
            user = await authTestUtils.makeAndSaveUser();
            accessToken = await authTestUtils.generateJwtToken(
                UserFactory.DEFAULT_USERNAME,
                UserFactory.DEFAULT_PASSWORD,
            );
            jwtAuthHeader = await authTestUtils.getJwtAuthHeader(accessToken);
        });

        afterEach(async () => {
            await authTestUtils.revokedTokensService.clearRevokedTokens();
        });

        it('when request is not authorized should return unauthorized error', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/jwt/logout')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when access token is revoked should return unauthorized error', async () => {
            await authTestUtils.revokeJwtToken(accessToken);

            return request(app.getHttpServer())
                .post('/api/auth/jwt/logout')
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when user not found should return return unauthorized error', async () => {
            await authTestUtils.userRepository.remove(user);

            return request(app.getHttpServer())
                .post('/api/auth/jwt/logout')
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when access token is valid should return successful response', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/jwt/logout')
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(201);
        });
    });
});
