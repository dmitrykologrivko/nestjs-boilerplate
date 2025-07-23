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
            expect(meta.onInit).toHaveBeenCalledTimes(1);
            expect(meta.onInit).toHaveBeenCalledWith(mockContainer);
            expect(loader1.load).toHaveBeenCalledTimes(1);
            expect(loader1.load).toHaveBeenCalledWith(mockContainer);
            expect(loader2.load).toHaveBeenCalledTimes(1);
            expect(loader2.load).toHaveBeenCalledWith(mockContainer);
            expect(mockContainer.get).toHaveBeenCalledTimes(1);
            expect(mockContainer.get).toHaveBeenCalledWith(PropertyConfigService);
            expect(mockContainer.listen).toHaveBeenCalledTimes(1);
            expect(mockContainer.listen).toHaveBeenCalledWith(SERVER_PORT_PROPERTY.defaultValue);
            expect(propertyConfigService.get).toHaveBeenCalledTimes(1);
            expect(propertyConfigService.get).toHaveBeenCalledWith(SERVER_PORT_PROPERTY);
        });
    });
});
