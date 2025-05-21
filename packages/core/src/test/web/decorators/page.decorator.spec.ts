import * as request from 'supertest';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from '../../../web/decorators/page.decorator';

describe('Page Decorator (Integration)', () => {
    @Controller('pagination')
    class TestController {
        @Get()
        getPagination(@Page() pagination: any): any {
            return pagination;
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

    it('should return default pagination values when no query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/pagination')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            path: response.request.url
        });
    });

    it('should return correct pagination values when query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/pagination')
            .query({ limit: 20, page: 5 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            limit: 20,
            page: 5,
            path: response.request.url
        });
    });

    it('should handle invalid query parameters gracefully', async () => {
        const response = await request(app.getHttpServer())
            .get('/pagination')
            .query({ limit: 'invalid', offset: 'invalid' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            path: response.request.url
        });
    });
});