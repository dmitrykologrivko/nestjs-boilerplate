import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { BootstrapperMeta } from './base.bootstrapper';
import { ServerBootstrapper } from './server.bootstrapper';
import { ManagementBootstrapper } from './management.bootstrapper';
import { COMMAND_ARG } from '../management/management.constants';

export async function bootstrapApplication(
    options: BootstrapperMeta<INestApplication, NestApplicationOptions>,
): Promise<void> {
    if (process.argv.includes(COMMAND_ARG)) {
        await new ManagementBootstrapper({ module: options.module })
            .start();
    } else {
        await new ServerBootstrapper(options)
            .start();
    }
}
