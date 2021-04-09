import { INestApplicationContext } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapperMeta, BaseBootstrapper } from '@nestjs-boilerplate/core';

export interface TestBootstrapperMeta<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> extends BootstrapperMeta<T, V> {

    testingMetadata?: ModuleMetadata;
}

export abstract class BaseTestBootstrapper<T extends INestApplicationContext = INestApplicationContext,
    V extends NestApplicationContextOptions = NestApplicationContextOptions> extends BaseBootstrapper<T, V> {

    constructor(protected meta: TestBootstrapperMeta<T, V>) {
        super(meta);
    }

    protected async createTestingModule(): Promise<TestingModule> {
        return await Test.createTestingModule({
            imports: [this.meta.module, ...this.meta.testingMetadata?.imports || []],
            ...this.meta.testingMetadata,
        }).compile();
    }
}
