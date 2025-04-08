import {
    INestApplication,
    INestApplicationContext,
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

interface AlternativeBootstrapper {
    bootstrapper: BaseBootstrapper;
    isApplicable: boolean;
}

export class Bootstrap {
    constructor(
        protected readonly module: any,
        protected readonly altBootstrappers: AlternativeBootstrapper[] = [],
    ) {
        this.altBootstrappers.push(
            {
                bootstrapper: new ManagementBootstrapper({ module: this.module }),
                isApplicable: process.argv.includes(COMMAND_ARG),
            },
        );
    }

    async startApplication<T extends INestApplication = INestApplication>(
        meta?: Pick<ApplicationBootstrapperMeta<T>, 'adapter' | 'port' | 'options' | 'onInit' | 'loaders'>,
    ): Promise<T> {
        return await this.start<T>(
            new ApplicationBootstrapper<T>({ module: this.module, ...meta }),
        );
    }

    async startMicroservice<T extends NestMicroserviceOptions & object = NestMicroserviceOptions>(
        meta?: Pick<BootstrapperMeta<INestMicroservice, T>, 'options' | 'onInit' | 'loaders'>,
    ): Promise<INestMicroservice> {
        return await this.start<INestMicroservice>(
            new MicroserviceBootstrapper<T>({ module: this.module, ...meta }),
        );
    }

    protected async start<T extends INestApplicationContext>(bootstrapper: BaseBootstrapper<T>): Promise<T> {
        for (const altBootstrapper of this.altBootstrappers) {
            if (altBootstrapper.isApplicable) {
                await altBootstrapper.bootstrapper.start();
                return;
            }
        }

        return await bootstrapper.start();
    }
}
