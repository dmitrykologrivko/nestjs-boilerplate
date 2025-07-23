import { INestMicroservice } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import { BaseLoader } from '../../bootstrap/base.loader';
import { BootstrapperMeta } from '../../bootstrap/base.bootstrapper';
import { MicroserviceBootstrapper } from '../../bootstrap/microservice.bootstrapper';

describe('MicroserviceBootstrapper', () => {
    const mockContainer: MockProxy<INestMicroservice> = mock<INestMicroservice>();

    class MockApplicationBootstrapper extends MicroserviceBootstrapper {
        protected async createContainer(): Promise<INestMicroservice> {
            return mockContainer;
        }
    }

    let loader1: MockProxy<BaseLoader>;
    let loader2: MockProxy<BaseLoader>;
    let meta: MockProxy<BootstrapperMeta>;
    let bootstrapper: MicroserviceBootstrapper;

    beforeEach(() => {
        loader1 = mock<BaseLoader>();
        loader2 = mock<BaseLoader>();

        meta = mock<BootstrapperMeta>();
        meta.loaders = [loader1, loader2];

        bootstrapper = new MockApplicationBootstrapper(meta);
    });

    describe('#start()', () => {
        it('should start the microservice', async () => {
            const app = await bootstrapper.start();

            expect(app).toBeDefined();
            expect(app).toEqual(mockContainer);
            expect(meta.onInit).toHaveBeenCalledTimes(1);
            expect(meta.onInit).toHaveBeenCalledWith(mockContainer);
            expect(loader1.load).toHaveBeenCalledTimes(1);
            expect(loader1.load).toHaveBeenCalledWith(mockContainer);
            expect(loader2.load).toHaveBeenCalledTimes(1);
            expect(loader2.load).toHaveBeenCalledWith(mockContainer);
            expect(mockContainer.listen).toHaveBeenCalledTimes(1);
        });
    });
});
