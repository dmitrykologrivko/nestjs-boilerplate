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
        meta?: Pick<TestApplicationBootstrapperMeta<T>, 'httpAdapter' | 'options' | 'onInit' | 'loaders'>,
    ): Promise<T> {
        return await new TestApplicationBootstrapper<T>({ module: this.module, ...meta })
            .start();
    }

    async startMicroservice<T extends NestMicroserviceOptions = NestMicroserviceOptions>(
        meta?: Pick<TestBootstrapperMeta<INestMicroservice, T>, 'options' | 'onInit' | 'loaders'>,
    ): Promise<INestMicroservice> {
        return await new TestMicroserviceBootstrapper<T>({ module: this.module, ...meta })
            .start();
    }
}
