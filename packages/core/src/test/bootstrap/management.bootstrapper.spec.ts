import { INestApplicationContext } from '@nestjs/common';
import { MockProxy, mock } from 'jest-mock-extended';
import { ManagementService } from '../../management/management.service';
import { BaseLoader } from '../../bootstrap/base.loader';
import { BootstrapperMeta } from '../../bootstrap/base.bootstrapper';
import { ManagementBootstrapper } from '../../bootstrap/management.bootstrapper';

describe('ManagementBootstrapper', () => {
    const mockContainer: MockProxy<INestApplicationContext> = mock<INestApplicationContext>();
    let isProcessExited = false;
    let isProcessAborted = false;

    class MockApplicationBootstrapper extends ManagementBootstrapper {
        protected async createContainer(): Promise<INestApplicationContext> {
            return mockContainer;
        }

        protected abort() {
            isProcessAborted = true;
        }

        protected exit() {
            isProcessExited = true;
        }
    }

    let managementService: MockProxy<ManagementService>;
    let loader1: MockProxy<BaseLoader>;
    let loader2: MockProxy<BaseLoader>;
    let meta: MockProxy<BootstrapperMeta>;
    let bootstrapper: ManagementBootstrapper;

    beforeEach(() => {
        isProcessAborted = false;
        isProcessExited = false;

        managementService = mock<ManagementService>();

        loader1 = mock<BaseLoader>();
        loader2 = mock<BaseLoader>();

        meta = mock<BootstrapperMeta>();
        meta.loaders = [loader1, loader2];

        bootstrapper = new MockApplicationBootstrapper(meta);

        mockContainer.get
            .calledWith(ManagementService)
            .mockReturnValue(managementService);
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
            expect(mockContainer.get).toHaveBeenCalledWith(ManagementService);
            expect(managementService.exec).toHaveBeenCalledTimes(1);
            expect(isProcessExited).toBeTruthy();
            expect(isProcessAborted).toBeFalsy();
        });

        it('should catch an error and abort the app', async () => {
            managementService.exec.mockImplementation(() => {
                throw new Error('test error');
            });

            const app = await bootstrapper.start();

            expect(app).toBeDefined();
            expect(app).toEqual(mockContainer);
            expect(meta.onInit).toHaveBeenCalledTimes(1);
            expect(meta.onInit).toHaveBeenCalledWith(mockContainer);
            expect(loader1.load).toHaveBeenCalledTimes(1);
            expect(loader1.load).toHaveBeenCalledWith(mockContainer);
            expect(loader2.load).toHaveBeenCalledTimes(1);
            expect(loader2.load).toHaveBeenCalledWith(mockContainer);
            expect(mockContainer.get).toHaveBeenCalledWith(ManagementService);
            expect(managementService.exec).toHaveBeenCalledTimes(1);
            expect(isProcessExited).toBeFalsy();
            expect(isProcessAborted).toBeTruthy();
        });
    });
});
