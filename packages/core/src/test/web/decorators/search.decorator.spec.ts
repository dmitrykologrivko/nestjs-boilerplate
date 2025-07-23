import * as request from 'supertest';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Search } from '../../../web/decorators/search.decorator';

describe('Search Decorator (Integration)', () => {
    @Controller('search')
    class TestController {
        @Get()
        getSearch(@Search() search: any): any {
            return search;
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

    it('should return default search values when no query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/search')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            search: '',
        });
    });

    it('should return correct search value when query parameter is provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/search')
            .query({ search: 'test' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            search: 'test',
        });
    });

    it('should handle invalid search query gracefully', async () => {
        const response = await request(app.getHttpServer())
            .get('/search')
            .query({ search: null });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            search: '',
        });
    });
});