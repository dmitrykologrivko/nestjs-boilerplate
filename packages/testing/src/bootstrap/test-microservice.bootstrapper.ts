import { INestMicroservice } from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import {
    BaseTestBootstrapper,
    TestBootstrapperMeta,
} from './base-test.bootstrapper';

export class TestMicroserviceBootstrapper<T extends NestMicroserviceOptions & object = NestMicroserviceOptions>
    extends BaseTestBootstrapper<INestMicroservice, T> {

    constructor(protected meta: TestBootstrapperMeta<INestMicroservice, T>) {
        super(meta);
    }

    protected async createContainer(): Promise<INestMicroservice> {
        return (await this.createTestingModule())
            .createNestMicroservice<T>(this.meta.options);
    }

    protected async onStart(container: INestMicroservice): Promise<INestMicroservice> {
        return await container.init();
    }
}
