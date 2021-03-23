import { INestApplication } from '@nestjs/common';
import { BaseTestBootstrapper } from './base-test.bootstrapper';

export class TestApplicationBootstrapper extends BaseTestBootstrapper<INestApplication> {

    protected async createContainer(): Promise<INestApplication> {
        return (await this.createTestingModule())
            .createNestApplication();
    }

    protected async onStart(container: INestApplication): Promise<INestApplication> {
        return await container.init();
    }
}
