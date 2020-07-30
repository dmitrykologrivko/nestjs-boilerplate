import { INestApplicationContext } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';

export interface TestingBootstrapper {
    container: INestApplicationContext;
    init: () => Promise<void>;
}

export interface TestingBootstrapOptions {
    module: any;
    testingMetadata?: ModuleMetadata;
}

export async function bootstrapTestingApplication(options: TestingBootstrapOptions): Promise<TestingBootstrapper> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [options.module, ...options.testingMetadata?.imports || []],
        ...options.testingMetadata,
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Set dependency injection container for class validator
    useContainer(app.select(options.module), { fallbackOnErrors: true });

    const init = async () => {
        await app.init();
    };

    return {
        container: app,
        init,
    };
}
