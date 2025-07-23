import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './application-src/app.module';
import { Bootstrap } from '../../src/bootstrap/bootstrap.util';
import { PORT } from './constants';

describe('Application Bootstrap (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await new Bootstrap(AppModule)
            .startApplication({ port: PORT });
    });

    afterAll(async () => {
        await app.close();
    });

    it('app should be defined', async () => {
        expect(app).toBeDefined();
    });

    it('should respond to ping', async () => {
        return request(app.getHttpServer())
            .get('/ping')
            .expect(200)
            .expect('pong');
    });
});
