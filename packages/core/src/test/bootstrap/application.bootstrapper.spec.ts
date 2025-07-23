import { INestApplication } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import { PropertyConfigService } from '../../config/property-config.service';
import { SERVER_PORT_PROPERTY } from '../../server/server.properties';
import { BaseLoader  } from '../../bootstrap/base.loader';
import { ApplicationBootstrapper, ApplicationBootstrapperMeta } from '../../bootstrap/application.bootstrapper';

describe('ApplicationBootstrapper', () => {
    const mockContainer: MockProxy<INestApplication> = mock<INestApplication>();

    class MockApplicationBootstrapper extends ApplicationBootstrapper {
        protected async createContainer(): Promise<INestApplication> {
            return mockContainer;
        }
    }

    let propertyConfigService: MockProxy<PropertyConfigService>;
    let loader1: MockProxy<BaseLoader>;
    let loader2: MockProxy<BaseLoader>;
    let meta: MockProxy<ApplicationBootstrapperMeta>;
    let bootstrapper: ApplicationBootstrapper;

    beforeEach(() => {
        propertyConfigService = mock<PropertyConfigService>();

        loader1 = mock<BaseLoader>();
        loader2 = mock<BaseLoader>();

        meta = mock<ApplicationBootstrapperMeta>();
        meta.port = undefined;
        meta.loaders = [loader1, loader2];

        bootstrapper = new MockApplicationBootstrapper(meta);

        propertyConfigService.get
            .calledWith(SERVER_PORT_PROPERTY)
            .mockReturnValue(SERVER_PORT_PROPERTY.defaultValue);
        mockContainer.get
            .calledWith(PropertyConfigService)
            .mockReturnValue(propertyConfigService);
    });

    describe('#start()', () => {
        it('should start the app', async () => {
            const app = await bootstrapper.start();

            expect(app).toBeDefined();
            expect(app).toEqual(mockContainer);
            expect(meta.onInit).toBeCalledTimes(1);
            expect(meta.onInit).toBeCalledWith(mockContainer);
            expect(loader1.load).toBeCalledTimes(1);
            expect(loader1.load).toBeCalledWith(mockContainer);
            expect(loader2.load).toBeCalledTimes(1);
            expect(loader2.load).toBeCalledWith(mockContainer);
            expect(mockContainer.get).toBeCalledTimes(1);
            expect(mockContainer.get).toBeCalledWith(PropertyConfigService);
            expect(mockContainer.listen).toBeCalledTimes(1);
            expect(mockContainer.listen).toBeCalledWith(SERVER_PORT_PROPERTY.defaultValue);
            expect(propertyConfigService.get).toBeCalledTimes(1);
            expect(propertyConfigService.get).toBeCalledWith(SERVER_PORT_PROPERTY);
        });
    });
});
