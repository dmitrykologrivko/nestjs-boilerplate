import {
    INestApplication,
    INestApplicationContext,
    INestMicroservice,
} from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { mock, MockProxy } from 'jest-mock-extended';
import { Bootstrap, StartApplicationMeta, StartMicroserviceMeta } from '../../bootstrap/bootstrap.util';
import { ApplicationBootstrapper } from '../../bootstrap/application.bootstrapper';
import { MicroserviceBootstrapper } from '../../bootstrap/microservice.bootstrapper';
import { ManagementBootstrapper } from '../../bootstrap/management.bootstrapper';

describe('Bootstrap', () => {
    const applicationBootstrapper = mock<ApplicationBootstrapper>();
    const microserviceBootstrapper = mock<MicroserviceBootstrapper>();
    const managementBootstrapper = mock<ManagementBootstrapper>();

    let shouldUseManagementBootstrapper = false;

    class MockBootstrapper extends Bootstrap {
        constructor() {
            super({});
        }

        protected getApplicationBootstrapper<T extends INestApplication = INestApplication>(
            _?: StartApplicationMeta<T>,
        ) {
            return applicationBootstrapper as unknown as ApplicationBootstrapper<T>;
        }

        protected getMicroserviceBootstrapper<T extends NestMicroserviceOptions & object = NestMicroserviceOptions & object>(
            _?: StartMicroserviceMeta<T>
        ): MicroserviceBootstrapper<T> {
            return microserviceBootstrapper as unknown as MicroserviceBootstrapper<T>;
        }

        protected getManagementBootstrapper(): ManagementBootstrapper {
            return managementBootstrapper;
        }

        protected isManagementBootstrapperApplicable(): boolean {
            return shouldUseManagementBootstrapper;
        }
    }

    let bootstrap: MockBootstrapper;

    beforeEach(() => {
        shouldUseManagementBootstrapper = false;
        bootstrap = new MockBootstrapper();
    });

    describe('#startApplication()', () => {
        it('should call start on the application bootstrapper', async () => {
            const mockApp = {} as INestApplication;
            applicationBootstrapper.start.mockResolvedValue(mockApp);

            const result = await bootstrap.startApplication();

            expect(applicationBootstrapper.start).toHaveBeenCalled();
            expect(result).toBe(mockApp);
        });

        it('should call start on the management bootstrapper if applicable', async () => {
            shouldUseManagementBootstrapper = true;
            bootstrap = new MockBootstrapper();

            const mockApp = {} as INestApplicationContext;
            managementBootstrapper.start.mockResolvedValue(mockApp);

            const result = await bootstrap.startApplication();

            expect(managementBootstrapper.start).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('#startMicroservice()', () => {
        it('should call start on the microservice bootstrapper', async () => {
            const mockMicroservice = {} as INestMicroservice;
            microserviceBootstrapper.start.mockResolvedValue(mockMicroservice);

            const result = await bootstrap.startMicroservice();

            expect(microserviceBootstrapper.start).toHaveBeenCalled();
            expect(result).toBe(mockMicroservice);
        });

        it('should call start on the management bootstrapper if applicable', async () => {
            shouldUseManagementBootstrapper = true;
            bootstrap = new MockBootstrapper();

            const mockApp = {} as INestApplicationContext;
            managementBootstrapper.start.mockResolvedValue(mockApp);

            const result = await bootstrap.startMicroservice();

            expect(managementBootstrapper.start).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});
