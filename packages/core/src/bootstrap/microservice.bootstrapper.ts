import { NestFactory } from '@nestjs/core';
import { INestMicroservice } from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { BaseBootstrapper } from './base.bootstrapper';

export class MicroserviceBootstrapper<T extends NestMicroserviceOptions & object = NestMicroserviceOptions>
    extends BaseBootstrapper<INestMicroservice, T> {

    protected async createContainer(): Promise<INestMicroservice> {
        return await NestFactory.createMicroservice<T>(
            this.meta.module,
            this.meta.options,
        );
    }

    protected async onStart(container: INestMicroservice): Promise<void | INestMicroservice> {
        return await container.listen();
    }
}
