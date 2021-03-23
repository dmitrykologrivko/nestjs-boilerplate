import { INestApplicationContext } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { useContainer } from 'class-validator';

export interface BootstrapperMeta<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> {
    module: any;
    options?: V;
    onCustomInit?: (container: T) => Promise<void>;
}

export abstract class BaseBootstrapper<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> {

    constructor(
        protected meta: BootstrapperMeta<T, V>,
    ) {}

    protected abstract async createContainer(module: any, options: V): Promise<T>;

    protected abstract async onStart(container: T): Promise<void>;

    protected async onInit(container: T) {
        // Set dependency injection container for class validator
        useContainer(container.select(this.meta.module), { fallbackOnErrors: true });
    }

    async start(): Promise<void> {
        const container = await this.createContainer(this.meta.module, this.meta.options);

        await this.onInit(container);

        if (this.meta.onCustomInit) {
            await this.meta.onCustomInit(container);
        }

        await this.onStart(container);
    }
}
