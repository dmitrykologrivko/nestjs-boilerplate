import { INestApplication } from '@nestjs/common';
import { TestBootstrapperMeta } from './base-test.bootstrapper';
import { TestApplicationBootstrapper } from './test-application.bootstrapper';

export async function bootstrapTestApplication(meta: TestBootstrapperMeta): Promise<INestApplication> {
    return new TestApplicationBootstrapper(meta)
        .start();
}
