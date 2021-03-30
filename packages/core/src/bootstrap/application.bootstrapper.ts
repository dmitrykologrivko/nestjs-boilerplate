import { NestFactory, AbstractHttpAdapter } from '@nestjs/core';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { PropertyConfigService } from '../config/property-config.service';
import { SERVER_PORT_PROPERTY } from '../server/server.properties';
import { BaseBootstrapper, BootstrapperMeta } from './base.bootstrapper';

export interface ApplicationBootstrapperMeta<T extends INestApplication = INestApplication,
    V extends NestApplicationOptions = NestApplicationOptions> extends BootstrapperMeta<T, V> {

    adapter?: AbstractHttpAdapter;
}

export class ApplicationBootstrapper<T extends INestApplication = INestApplication,
    V extends NestApplicationOptions = NestApplicationOptions> extends BaseBootstrapper<T, V> {

    constructor(
        protected meta: ApplicationBootstrapperMeta<T, V>,
    ) {
        super(meta);
    }

    protected async createContainer(): Promise<T> {
        return NestFactory.create<T>(
            this.meta.module,
            this.meta.adapter,
            this.meta.options,
        );
    }

    protected async onStart(container: T): Promise<void> {
        const config = container.get(PropertyConfigService);
        await container.listen(config.get(SERVER_PORT_PROPERTY));
    }
}
