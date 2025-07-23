import * as request from 'supertest';
import { INestApplication, Controller, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Where } from '../../../web/decorators/where.decorator';

describe('Where Decorator (Integration)', () => {
    @Controller('where')
    class TestController {
        @Get()
        getWhere(@Where() where: any): any {
            return where;
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

    it('should return default where values when no query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/where')
            .send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            where: [],
        });
    });

    it('should return correct where values when query parameters are provided', async () => {
        const response = await request(app.getHttpServer())
            .get('/where')
            .query({ where: 'name__eq=John' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            where: [
                ['name__eq', 'John'],
            ],
        });
    });

    it('should handle invalid where query gracefully', async () => {
        const response = await request(app.getHttpServer())
            .get('/where')
            .query({ where: 'invalid' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            where: [],
        });
    });
});
