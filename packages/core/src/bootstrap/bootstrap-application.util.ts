import { INestApplicationContext, INestApplication, NestApplicationOptions } from '@nestjs/common';
import { BootstrapperMeta, BaseBootstrapper } from './base.bootstrapper';
import { ServerBootstrapper } from './server.bootstrapper';
import { ManagementBootstrapper } from './management.bootstrapper';
import { COMMAND_ARG } from '../management/management.constants';

export async function bootstrapApplication(
    meta: BootstrapperMeta<INestApplication, NestApplicationOptions>,
): Promise<INestApplicationContext> {
    let bootstrapper: BaseBootstrapper;

    if (process.argv.includes(COMMAND_ARG)) {
        bootstrapper = new ManagementBootstrapper({ module: meta.module });
    } else {
        bootstrapper = new ServerBootstrapper(meta);
    }

    return await bootstrapper.start();
}
