import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { PropertyConfigService } from '../config/property-config.service';
import { HTTP_SERVER_PORT_PROPERTY } from '../http/constants/http.properties';
import { Bootstrapper, BootstrapOptions } from './bootstrap.interfaces';

export async function bootstrapServer(options: BootstrapOptions): Promise<Bootstrapper> {
    const app = await NestFactory.create(options.module);

    // Set dependency injection container for class validator
    useContainer(app.select(options.module), { fallbackOnErrors: true });

    const config = app.get(PropertyConfigService);

    const start = async () => {
        await app.listen(config.get(HTTP_SERVER_PORT_PROPERTY));
    };

    return {
        container: app,
        start,
    };
}
