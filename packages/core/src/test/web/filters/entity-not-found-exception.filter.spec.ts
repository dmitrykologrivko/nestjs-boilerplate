import * as request from 'supertest';
import {
    INestApplication,
    Controller,
    Get,
    UseFilters,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityNotFoundExceptionFilter } from '../../../web/filters/entity-not-found-exception.filter';
import { EntityNotFoundException } from '../../../domain/entities/entity-not-found.exception';

describe('EntityNotFoundExceptionFilter (Integration)', () => {
    @Controller('test')
    @UseFilters(EntityNotFoundExceptionFilter)
    class TestController {
        @Get()
        testEndpoint(): void {
            throw new EntityNotFoundException();
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

    it('should return 404 with proper error response when EntityNotFoundException is thrown', async () => {
        const response = await request(app.getHttpServer()).get('/test');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found',
        });
    });
});