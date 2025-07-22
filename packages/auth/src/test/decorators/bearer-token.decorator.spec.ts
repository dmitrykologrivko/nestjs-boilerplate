import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { BearerToken } from '../../decorators/bearer-token.decorator';

describe('BearerToken Decorator (Integration)', () => {
    @Controller()
    class TestController {
        @Get('token')
        getMe(@BearerToken() token: string) {
            return { token };
        }
    }

    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TestController],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should inject access token from request using BearerToken decorator', async () => {
        const response = await request(app.getHttpServer())
            .get('/token')
            .set('Authorization', 'Bearer test-token')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            token: 'test-token'
        });
    });
});
