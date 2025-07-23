import * as request from 'supertest';
import {
    INestApplication,
    Controller,
    Get,
    UseFilters,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordTokenInvalidExceptionFilter } from '../../filters/reset-password-token-invalid-exception.filter';
import { ResetPasswordTokenInvalidException } from '../../exceptions/reset-password-token-invalid.exception';

describe('ResetPasswordTokenInvalidExceptionFilter (Integration)', () => {
    @Controller('test-reset-token')
    @UseFilters(ResetPasswordTokenInvalidExceptionFilter)
    class TestResetTokenController {
        @Get()
        testEndpoint(): void {
            throw new ResetPasswordTokenInvalidException();
        }
    }

    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TestResetTokenController],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 401 with proper error response when ResetPasswordTokenInvalidException is thrown', async () => {
        const response = await request(app.getHttpServer()).get('/test-reset-token');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
        });
    });
});

