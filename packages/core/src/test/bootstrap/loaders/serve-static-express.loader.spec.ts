import { INestApplication, HttpServer } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import {
    ServeStaticExpressLoader,
    ServiceStaticOptions,
} from '../../../bootstrap/loaders/serve-static-express.loader';

describe('ServeStaticExpressLoader', () => {
    const ROOT_URL = '/';
    const URL = '/static';
    const options: ServiceStaticOptions = {
        cacheControl: true,
    };

    interface MockExpress {
        static: (path: string, options?: any) => object;
    }

    const mockExpress = mock<MockExpress>();
    mockExpress.static.mockReturnValue({});

    class MockServeStaticExpressLoader extends ServeStaticExpressLoader {
        protected loadExpress(): MockExpress {
            return mockExpress;
        }
    }

    let container: MockProxy<INestApplication>;
    let httpServer: MockProxy<HttpServer>;
    let loader: ServeStaticExpressLoader;

    beforeEach(async () => {
        container = mock<INestApplication>();
        httpServer = mock<HttpServer>();

        loader = new MockServeStaticExpressLoader(ROOT_URL, URL, options);

        container.getHttpAdapter.mockReturnValue(httpServer);
        httpServer.getType.mockReturnValue('express');
    });

    describe('#load', () => {
        it('should load express static middleware', async () => {
            await loader.load(container);

            expect(container.getHttpAdapter).toBeCalledTimes(1);
            expect(httpServer.getType).toBeCalledTimes(1);
            expect(container.use).toBeCalledTimes(1);
            expect(container.use.mock.calls[0][0]).toBe(URL);
            expect(container.use.mock.calls[0][1]).toBeDefined();
            expect(typeof container.use.mock.calls[0][1] === 'object').toBeTruthy();
            expect(mockExpress.static).toBeCalledTimes(1);
            expect(mockExpress.static).toBeCalledWith(ROOT_URL, options);
        });
    });
});
