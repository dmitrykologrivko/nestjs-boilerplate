import { INestApplication, HttpServer } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import { AbstractExpressLoader } from '../../../bootstrap/loaders/abstract-express.loader';

describe('AbstractExpressLoader', () => {
    let loaderIsAborted = false;

    class TestExpressLoader extends AbstractExpressLoader {
        constructor() {
            super(TestExpressLoader.name);
        }

        protected abort() {
            loaderIsAborted = true;
        }
    }

    let container: MockProxy<INestApplication>;
    let httpServer: MockProxy<HttpServer>;
    let loader: TestExpressLoader;

    beforeEach(async () => {
        container = mock<INestApplication>();
        httpServer = mock<HttpServer>();

        loader = new TestExpressLoader();

        container.getHttpAdapter.mockReturnValue(httpServer);
    });

    describe('#load()', () => {
        it('should check adapter type and do not abort if adapter is express', async () => {
            httpServer.getType.mockReturnValue('express');

            await loader.load(container);

            expect(container.getHttpAdapter).toHaveBeenCalledTimes(1);
            expect(httpServer.getType).toHaveBeenCalledTimes(1);
            expect(loaderIsAborted).toBeFalsy();
        });

        it('should check adapter type and do abort if adapter is not express', async () => {
            httpServer.getType.mockReturnValue('fastify');

            await loader.load(container);

            expect(container.getHttpAdapter).toHaveBeenCalledTimes(1);
            expect(httpServer.getType).toHaveBeenCalledTimes(1);
            expect(loaderIsAborted).toBeTruthy();
        });
    });
});
