import * as request from 'supertest';
import {
    INestApplication,
    Controller,
    Get,
    UseFilters,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsInvalidException } from '../../exceptions/credentials-invalid.exception';
import { CredentialsInvalidExceptionFilter } from '../../filters/credentials-invalid-exception.filter';

describe('CredentialsInvalidExceptionFilter (Integration)', () => {
    @Controller('test-credentials')
    @UseFilters(CredentialsInvalidExceptionFilter)
    class TestCredentialsController {
        @Get()
        testEndpoint(): void {
            throw new CredentialsInvalidException();
        }
    }

    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TestCredentialsController],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 401 with proper error response when CredentialsInvalidException is thrown', async () => {
        const response = await request(app.getHttpServer()).get('/test-credentials');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
        });
    });
});
