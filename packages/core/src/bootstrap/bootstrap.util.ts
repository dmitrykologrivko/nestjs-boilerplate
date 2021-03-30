import {
    INestApplication,
    NestApplicationOptions,
    INestMicroservice,
} from '@nestjs/common';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import {
    BaseBootstrapper,
    BootstrapperMeta,
} from './base.bootstrapper';
import {
    ApplicationBootstrapper,
    ApplicationBootstrapperMeta,
} from './application.bootstrapper';
import { MicroserviceBootstrapper } from './microservice.bootstrapper';
import { ManagementBootstrapper } from './management.bootstrapper';
import { COMMAND_ARG } from '../management/management.constants';

export class Bootstrap {
    constructor(
        protected module: any,
    ) {}

    async startApplication<T extends INestApplication = INestApplication,
        V extends NestApplicationOptions = NestApplicationOptions>(
        meta?: Pick<ApplicationBootstrapperMeta<T, V>, 'adapter' | 'options' | 'onCustomInit' | 'loaders'>,
    ) {
        await this.start(
            new ApplicationBootstrapper<T, V>({ module: this.module, ...meta }),
        );
    }

    async startMicroservice<T extends INestMicroservice = INestMicroservice,
        V extends NestMicroserviceOptions = NestMicroserviceOptions>(
        meta?: Pick<BootstrapperMeta<T, V>, 'options' | 'onCustomInit' | 'loaders'>,
    ) {
        await this.start(
            new MicroserviceBootstrapper<T, V>({ module: this.module, ...module }),
        );
    }

    protected async start(bootstrapper: BaseBootstrapper) {
        if (process.argv.includes(COMMAND_ARG)) {
            await new ManagementBootstrapper({ module: this.module })
                .start();
        } else {
            await bootstrapper.start();
        }
    }
}
