import { INestApplication, HttpServer } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import { NUNJUCKS_TOKEN } from '../../../template/template.constants';
import { NunjucksExpressLoader } from '../../../bootstrap/loaders/nunjucks-express.loader';

describe('NunjucksExpressLoader', () => {
    interface MockNunjucksService {
        express: (express: any) => any;
    }

    let container: MockProxy<INestApplication>;
    let httpServer: MockProxy<HttpServer>;
    let nunjucksService: MockProxy<MockNunjucksService>;
    let loader: NunjucksExpressLoader;

    beforeEach(async () => {
        container = mock<INestApplication>();
        httpServer = mock<HttpServer>();
        nunjucksService = mock<MockNunjucksService>();

        loader = new NunjucksExpressLoader();

        container.get.calledWith(NUNJUCKS_TOKEN).mockReturnValue(nunjucksService);
        container.getHttpAdapter.mockReturnValue(httpServer);
        httpServer.getType.mockReturnValue('express');
        nunjucksService.express.mockResolvedValue({});
    });

    describe('#load', () => {
        it('should load nunjucks and express', async () => {
            await loader.load(container);

            expect(container.getHttpAdapter).toBeCalledTimes(1);
            expect(httpServer.getType).toBeCalledTimes(1);
            expect(nunjucksService.express).toBeCalledTimes(1);
            expect(nunjucksService.express).toBeCalledWith(container);
        });
    });
});
