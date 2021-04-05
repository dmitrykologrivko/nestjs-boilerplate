import {
    INestApplication,
    NestApplicationOptions,
    HttpServer,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import {
    BaseTestBootstrapper,
    TestBootstrapperMeta,
} from './base-test.bootstrapper';

export interface TestApplicationBootstrapperMeta<T extends INestApplication = INestApplication>
    extends TestBootstrapperMeta<T, NestApplicationOptions> {

    httpAdapter?: HttpServer | AbstractHttpAdapter;
    options?: NestApplicationOptions;
}

export class TestApplicationBootstrapper<T extends INestApplication = INestApplication>
    extends BaseTestBootstrapper<T, NestApplicationOptions> {

    constructor(protected meta: TestApplicationBootstrapperMeta<T>) {
        super(meta);
    }

    protected async createContainer(): Promise<T> {
        return (await this.createTestingModule())
            .createNestApplication<T>(this.meta.httpAdapter, this.meta.options);
    }

    protected async onStart(container: T): Promise<T> {
        return await container.init();
    }
}
