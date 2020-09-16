import * as request from 'supertest';
import { bootstrapTestingApplication } from '@nest-boilerplate/testing';
import { User } from '../src/entities';
import { UserFactory } from '../src/test/factories/user.factory';
import { AuthTestUtils } from '../src/test/auth-test.utils';
import { AppModule } from './src/app.module';
import unauthorizedResponse from './responses/unauthorized.response';

describe('AuthJwtController (e2e)', () => {
    let app;
    let authTestUtils: AuthTestUtils;

    beforeAll(async () => {
        const bootstrapper = await bootstrapTestingApplication({ module: AppModule });
        app = bootstrapper.container;
        await bootstrapper.init();

        authTestUtils = new AuthTestUtils(app);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await authTestUtils.clearAllUsers();
    });

    describe('/api/auth/login (POST)', () => {
        it('when user not exist should return unauthorized error', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when user is inactive should return unauthorized error', async () => {
            const user = await authTestUtils.makeAndSaveUser();
            user.deactivateUser();
            await authTestUtils.saveUser(user);

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: UserFactory.DEFAULT_PASSWORD,
                })
                .set('Accept', 'application/json')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when wrong password is provided should return unauthorized error', async () => {
            await authTestUtils.makeAndSaveUser();

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    username: UserFactory.DEFAULT_USERNAME,
                    password: 'some-wrong-password',
                })
                .set('Accept', 'application/json')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when username and password are correct should return access token', async () => {
            await authTestUtils.makeAndSaveUser();

            return request(app.getHttpServer())
                .post('/api/auth/login')
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

    describe('/api/auth/logout (POST)', () => {
        let user: User;
        let accessToken: string;
        let jwtAuthHeader: string;

        beforeEach(async () => {
            user = await authTestUtils.makeAndSaveUser();
            accessToken = await authTestUtils.generateJwtToken(user);
            jwtAuthHeader = await authTestUtils.getJwtAuthHeader(accessToken);
        });

        afterEach(async () => {
            await authTestUtils.revokedTokenRepository.clear();
        });

        it('when request is not authorized should return unauthorized error', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/logout')
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when access token is revoked should return unauthorized error', async () => {
            await authTestUtils.revokeJwtToken(accessToken);

            return request(app.getHttpServer())
                .post('/api/auth/logout')
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when user not found should return return unauthorized error', async () => {
            await authTestUtils.userRepository.remove(user);

            return request(app.getHttpServer())
                .post('/api/auth/logout')
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(401)
                .expect(unauthorizedResponse);
        });

        it('when access token is valid should return successful response', async () => {
            return request(app.getHttpServer())
                .post('/api/auth/logout')
                .set('Accept', 'application/json')
                .set('Authorization', jwtAuthHeader)
                .expect(201);
        });
    });
});
