import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { PropertyConfigService } from '../config/property-config.service';
import { SERVER_PORT_PROPERTY } from '../server/server.properties';
import { Bootstrapper, BootstrapOptions } from './bootstrap.interfaces';

export async function bootstrapServer(options: BootstrapOptions): Promise<Bootstrapper> {
    const app = await NestFactory.create(options.module);

    // Set dependency injection container for class validator
    useContainer(app.select(options.module), { fallbackOnErrors: true });

    const config = app.get(PropertyConfigService);

    const start = async () => {
        await app.listen(config.get(SERVER_PORT_PROPERTY));
    };

    return {
        container: app,
        start,
    };
}
