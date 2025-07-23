import * as request from 'supertest';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SortBy } from '../../../web/decorators/sort-by.decorator';

describe('SortBy Decorator (Integration)', () => {
    @Controller('sort')
    class TestController {
        @Get()
        getSort(@SortBy() sortBy: any): any {
            return sortBy;
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

    it('should return default sort values when no query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/sort')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            sortBy: [],
        });
    });

    it('should return correct sort values when query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/sort')
            .query({ sortBy: 'name,-age' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            sortBy: ['name', '-age'],
        });
    });

    it('should handle invalid sort query gracefully', async () => {
        const response = await request(app.getHttpServer())
            .get('/sort')
            .query({ sortBy: null });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            sortBy: [],
        });
    });
});