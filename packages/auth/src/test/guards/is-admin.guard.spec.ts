import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, UseGuards, INestApplication } from '@nestjs/common';
import { IsAdminGuard } from '../../guards/is-admin.guard';

describe('IsAdminGuard (Integration)', () => {
    @Controller()
    @UseGuards(IsAdminGuard)
    class AdminTestController {
        @Get('protected')
        getProtected() {
            return { message: 'admin access granted' };
        }
    }

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [AdminTestController],
        }).compile();

        app = moduleRef.createNestApplication();
        // Middleware to inject test user into request
        app.use((req, res, next) => {
            req.user = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : undefined;
            next();
        });

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should allow access for active admin user', async () => {
        const user = { isActive: true, isAdmin: true };
        const res = await request(app.getHttpServer())
            .get('/protected')
            .set('x-user', JSON.stringify(user));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({message: 'admin access granted'});
    });

    it('should deny access for inactive user', async () => {
        const user = { isActive: false, isAdmin: true };
        const res = await request(app.getHttpServer())
            .get('/protected')
            .set('x-user', JSON.stringify(user));

        expect(res.status).toBe(403);
    });

    it('should deny access for non-admin user', async () => {
        const user = { isActive: true, isAdmin: false };
        const res = await request(app.getHttpServer())
            .get('/protected')
            .set('x-user', JSON.stringify(user));

        expect(res.status).toBe(403);
    });

    it('should deny access if user is missing', async () => {
        const res = await request(app.getHttpServer())
            .get('/protected');

        expect(res.status).toBe(403);
    });
});
