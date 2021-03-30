import { NestFactory } from '@nestjs/core';
import { INestMicroservice } from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { BaseBootstrapper } from './base.bootstrapper';

export class MicroserviceBootstrapper<T extends INestMicroservice = INestMicroservice,
    V extends NestMicroserviceOptions = NestMicroserviceOptions> extends BaseBootstrapper<T, V> {

    protected async createContainer(): Promise<T> {
        return await NestFactory.createMicroservice<V>(
            this.meta.module,
            this.meta.options,
        ) as T;
    }

    protected async onStart(container: T): Promise<void | T> {
        return await container.listenAsync();
    }
}
