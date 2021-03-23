import { NestFactory } from '@nestjs/core';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { ManagementService } from '../management/management.service';
import { BaseBootstrapper } from './base.bootstrapper';

export class ManagementBootstrapper extends BaseBootstrapper {

    protected async createContainer(
        module: any,
        options: NestApplicationContextOptions,
    ): Promise<INestApplicationContext> {
        return await NestFactory.createApplicationContext(module, options);
    }

    protected async onStart(container: INestApplicationContext): Promise<void> {
        try {
            await container.get(ManagementService).exec();
        } catch (e) {
            Logger.error(e.message, e.stack);
            process.exit(1);
        }

        process.exit(0);
    }
}
