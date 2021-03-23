import { NestFactory } from '@nestjs/core';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { PropertyConfigService } from '../config/property-config.service';
import { SERVER_PORT_PROPERTY } from '../server/server.properties';
import { BaseBootstrapper } from './base.bootstrapper';

export class ServerBootstrapper extends BaseBootstrapper<INestApplication, NestApplicationOptions> {

    protected async createContainer(module: any, options: NestApplicationOptions): Promise<INestApplication> {
        return NestFactory.create(module, options);
    }

    protected async onStart(container: INestApplication): Promise<void> {
        const config = container.get(PropertyConfigService);
        await container.listen(config.get(SERVER_PORT_PROPERTY));
    }
}
