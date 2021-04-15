import {
    INestApplication,
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
        meta?: Pick<ApplicationBootstrapperMeta<T>, 'adapter' | 'options' | 'onInit' | 'loaders'>,
    ) {
        await this.start(
            new ApplicationBootstrapper<T>({ module: this.module, ...meta }),
        );
    }

    async startMicroservice<T extends NestMicroserviceOptions = NestMicroserviceOptions>(
        meta?: Pick<BootstrapperMeta<INestMicroservice, T>, 'options' | 'onInit' | 'loaders'>,
    ) {
        await this.start(
            new MicroserviceBootstrapper<T>({ module: this.module, ...module }),
        );
    }

    protected async start(bootstrapper: BaseBootstrapper) {
        for (const altBootstrapper of this.altBootstrappers) {
            if (altBootstrapper.isApplicable) {
                await altBootstrapper.bootstrapper.start();
                return;
            }
        }

        await bootstrapper.start();
    }
}
