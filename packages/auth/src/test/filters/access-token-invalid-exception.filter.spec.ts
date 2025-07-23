import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, UseFilters, INestApplication } from '@nestjs/common';
import { AccessTokenInvalidExceptionFilter } from '../../filters/access-token-invalid-exception.filter';
import { AccessTokenInvalidException } from '../../exceptions/access-token-invalid.exception';

describe('AccessTokenInvalidExceptionFilter (Integration)', () => {
    @Controller()
    @UseFilters(AccessTokenInvalidExceptionFilter)
    class TestAccessTokenController {
        @Get('fail')
        fail() {
            throw new AccessTokenInvalidException();
        }
    }

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [TestAccessTokenController],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 401 Unauthorized with correct response body', async () => {
        const res = await request(app.getHttpServer())
            .get('/fail');

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
        });
    });
});

