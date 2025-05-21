import * as request from 'supertest';
import { INestApplication, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from '../../../web/decorators/api-controller.decorator';

describe('ApiController Decorator (Integration)', () => {
    let app: INestApplication;

    @ApiController('prefix')
    class StringPrefixController {
        @Get()
        getTest(): string {
            return 'string prefix';
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    @ApiController({
        path: 'options',
        rootPrefix: 'root',
        versionNumber: 1,
        versionPrefix: 'v',
        additionalPrefixes: ['extra'],
    })
    class FullOptionsController {
        @Get()
        getTest(): string {
            return 'options';
        }
    }

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [
                StringPrefixController,
                FullOptionsController,
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should register controller with string prefix', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/prefix')
            .send({});

        expect(response.status).toBe(200);
        expect(response.text).toEqual('string prefix');
    });

    it('should register controller with options', async () => {
        const response = await request(app.getHttpServer())
            .get('/root/v1/extra/options')
            .send({});

        expect(response.status).toBe(200);
        expect(response.text).toEqual('options');
    });
});