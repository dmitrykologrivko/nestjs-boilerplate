import { INestApplicationContext } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { useContainer } from 'class-validator';
import { BaseLoader } from './base.loader';

export interface BootstrapperMeta<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> {
    module: any;
    options?: V;
    onInit?: (container: T) => Promise<void>;
    loaders?: BaseLoader<T>[];
}

export abstract class BaseBootstrapper<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> {

    constructor(
        protected meta: BootstrapperMeta<T, V>,
    ) {}

    protected abstract createContainer(): Promise<T>;

    protected abstract onStart(container: T): Promise<T | void>;

    protected async onInit(container: T) {
        // Set dependency injection container for class validator
        useContainer(container.select(this.meta.module), { fallbackOnErrors: true });
        return Promise.resolve();
    }

    protected async runLoaders(container: T) {
        for (const loader of this.meta.loaders) {
            await loader.load(container);
        }
    }

    async start(): Promise<T> {
        const container = await this.createContainer();

        await this.onInit(container);

        if (this.meta.onInit) {
            await this.meta.onInit(container);
        }

        if (this.meta.loaders) {
            await this.runLoaders(container);
        }

        return (await this.onStart(container)) || container;
    }
}
