import { INestApplicationContext } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import { BaseLoader  } from '../../bootstrap/base.loader';
import { BaseBootstrapper, BootstrapperMeta } from '../../bootstrap/base.bootstrapper';

describe('BaseBootstrapper', () => {
    const mockContainer: MockProxy<INestApplicationContext> = mock<INestApplicationContext>();

    class MockBoostrap extends BaseBootstrapper {
        protected async createContainer() {
            return mockContainer;
        }

        protected async onStart(container: INestApplicationContext) {
            return container;
        }
    }

    let loader1: MockProxy<BaseLoader>;
    let loader2: MockProxy<BaseLoader>;
    let meta: MockProxy<BootstrapperMeta>;
    let bootstrapper: BaseBootstrapper;

    beforeEach(() => {
        loader1 = mock<BaseLoader>();
        loader2 = mock<BaseLoader>();

        meta = mock<BootstrapperMeta>();
        meta.loaders = [loader1, loader2];

        bootstrapper = new MockBoostrap(meta);
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
        });
    });
});
