import * as request from 'supertest';
import {
    INestApplication,
    Controller,
    Get,
    UseFilters,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionDeniedExceptionFilter } from '../../../web/filters/permission-denied-exception.filter';
import { PermissionDeniedException } from '../../../application/permissions/permission-denied.exception';

describe('PermissionDeniedExceptionFilter (Integration)', () => {
    @Controller('test')
    @UseFilters(PermissionDeniedExceptionFilter)
    class TestController {
        @Get()
        testEndpoint(): void {
            throw new PermissionDeniedException();
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

    it('should return 403 with proper error response when PermissionDeniedException is thrown', async () => {
        const response = await request(app.getHttpServer()).get('/test');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied',
        });
    });
});