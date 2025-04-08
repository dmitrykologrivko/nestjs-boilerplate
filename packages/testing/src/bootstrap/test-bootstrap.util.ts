import {
    INestApplication,
    INestMicroservice,
} from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { TestBootstrapperMeta } from './base-test.bootstrapper';
import {
    TestApplicationBootstrapper,
    TestApplicationBootstrapperMeta,
} from './test-application.bootstrapper';
import { TestMicroserviceBootstrapper } from './test-microservice.bootstrapper';

export class TestBootstrap {
    constructor(
        protected readonly module: any,
    ) {}

    async startApplication<T extends INestApplication = INestApplication>(
        meta?: Omit<TestApplicationBootstrapperMeta<T>, 'module'>,
    ): Promise<T> {
        return await new TestApplicationBootstrapper<T>({ module: this.module, ...meta })
            .start();
    }

    async startMicroservice<T extends NestMicroserviceOptions & object = NestMicroserviceOptions>(
        meta?: Omit<TestBootstrapperMeta<INestMicroservice, T>, 'module'>,
    ): Promise<INestMicroservice> {
        return await new TestMicroserviceBootstrapper<T>({ module: this.module, ...meta })
            .start();
    }
}
