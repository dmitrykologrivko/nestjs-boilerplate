import * as request from 'supertest';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ListFilter } from '../../../web/decorators/list-filter.decorator';

describe('ListFilter Decorator (Integration)', () => {
    @Controller('list')
    class TestController {
        @Get()
        getList(@ListFilter() listFilter: any): any {
            return listFilter;
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

    it('should return default list filter values when no query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/list')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            query: {},
            params: {},
            search: '',
            sortBy: [],
            where: [],
            page: undefined,
            limit: undefined,
            offset: undefined,
            path: response.request.url,
        });
    });

    it('should return correct list filter values when query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/list')
            .query({
                search: 'test',
                sortBy: 'name,-age',
                where: 'name__eq=John',
                page: 2,
                limit: 10,
                offset: 5,
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            query: {
                search: 'test',
                sortBy: 'name,-age',
                where: 'name__eq=John',
                page: '2',
                limit: '10',
                offset: '5',
            },
            params: {},
            search: 'test',
            sortBy: ['name', '-age'],
            where: [['name__eq', 'John']],
            page: 2,
            limit: 10,
            offset: 5,
            path: response.request.url,
        });
    });

    it('should handle invalid query parameters gracefully', async () => {
        const response = await request(app.getHttpServer())
            .get('/list')
            .query({
                sortBy: null,
                where: 'invalid',
                page: 'invalid',
                limit: 'invalid',
                offset: 'invalid',
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            query: {
                sortBy: '',
                where: 'invalid',
                page: 'invalid',
                limit: 'invalid',
                offset: 'invalid',
            },
            params: {},
            search: '',
            sortBy: [],
            where: [],
            page: undefined,
            limit: undefined,
            offset: undefined,
            path: response.request.url,
        });
    });
});