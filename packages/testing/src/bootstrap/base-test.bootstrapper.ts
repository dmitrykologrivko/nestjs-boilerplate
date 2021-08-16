import { INestApplicationContext } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { BootstrapperMeta, BaseBootstrapper } from '@nestjs-boilerplate/core';

export interface TestBootstrapperMeta<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> extends BootstrapperMeta<T, V> {

    testingMetadata?: ModuleMetadata;

    onCreateTestingModule?: (builder: TestingModuleBuilder) => TestingModuleBuilder;

    onTestingModuleCreated?: (testingModule: TestingModule) => void;
}

export abstract class BaseTestBootstrapper<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> extends BaseBootstrapper<T, V> {

    constructor(protected meta: TestBootstrapperMeta<T, V>) {
        super(meta);
    }

    protected async createTestingModule(): Promise<TestingModule> {
        let builder = Test.createTestingModule({
            ...this.meta.testingMetadata,
            imports: [this.meta.module, ...this.meta.testingMetadata?.imports || []],
        });

        if (this.meta.onCreateTestingModule) {
            builder = this.meta?.onCreateTestingModule(builder);
        }

        const testingModule = await builder.compile();

        if (this.meta.onTestingModuleCreated) {
            this.meta.onTestingModuleCreated(testingModule);
        }

        return testingModule;
    }
}
