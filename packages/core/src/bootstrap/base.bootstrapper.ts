import { INestApplicationContext } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { useContainer } from 'class-validator';
import { BaseBootstrapperLoader } from './base-bootstrapper.loader';

export interface BootstrapperMeta<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> {
    module: any;
    options?: V;
    onCustomInit?: (container: T) => Promise<void>;
    loaders?: BaseBootstrapperLoader<T>[];
}

export abstract class BaseBootstrapper<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> {

    constructor(
        protected meta: BootstrapperMeta<T, V>,
    ) {}

    protected abstract async createContainer(): Promise<T>;

    protected abstract async onStart(container: T): Promise<T | void>;

    protected async onInit(container: T) {
        // Set dependency injection container for class validator
        useContainer(container.select(this.meta.module), { fallbackOnErrors: true });

        if (this.meta.loaders) {
            for (const loader of this.meta.loaders) {
                await loader.load(container);
            }
        }
    }

    async start(): Promise<T> {
        const container = await this.createContainer();

        await this.onInit(container);

        if (this.meta.onCustomInit) {
            await this.meta.onCustomInit(container);
        }

        return (await this.onStart(container)) || container;
    }
}
