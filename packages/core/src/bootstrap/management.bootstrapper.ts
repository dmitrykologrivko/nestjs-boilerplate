import { NestFactory } from '@nestjs/core';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ManagementService } from '../management/management.service';
import { BaseBootstrapper } from './base.bootstrapper';

export class ManagementBootstrapper extends BaseBootstrapper {

    protected async createContainer(): Promise<INestApplicationContext> {
        return await NestFactory.createApplicationContext(
            this.meta.module,
            this.meta.options,
        );
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
