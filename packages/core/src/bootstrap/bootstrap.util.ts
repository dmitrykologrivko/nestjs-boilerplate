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

export type StartApplicationMeta<T extends INestApplication = INestApplication> =
    Pick<ApplicationBootstrapperMeta<T>, 'adapter' | 'port' | 'options' | 'onInit' | 'loaders'>;

export type StartMicroserviceMeta<T extends NestMicroserviceOptions & object = NestMicroserviceOptions> =
    Pick<BootstrapperMeta<INestMicroservice, T>, 'options' | 'onInit' | 'loaders'>;

/**
 * The `Bootstrap` class is responsible for starting an application or microservice.
 * It provides methods to initialize and invoke the appropriate bootstrappers
 * for applications, microservices, or alternative bootstrappers.
 *
 * - The class supports alternative bootstrappers, which can be used when specific conditions are met.
 * - If an alternative bootstrapper is applicable, it will be used, and the main bootstrapper will not be invoked.
 * - Alternative bootstrappers can also be used to bootstrap application contexts for custom purposes,
 *   such as running cron tasks or executing console management commands.
 */
export class Bootstrap {
    constructor(
        protected readonly module: any,
        protected readonly altBootstrappers: AlternativeBootstrapper[] = [],
    ) {
        this.altBootstrappers.push(
            {
                bootstrapper: this.getManagementBootstrapper(),
                isApplicable: this.isManagementBootstrapperApplicable(),
            },
        );
    }

    /**
     * Starts the application by initializing and invoking the appropriate application bootstrapper.
     *
     * @template T - The type of the application, extending `INestApplication`.
     * @param {StartApplicationMeta<T>} [meta] - Optional metadata for configuring the application bootstrapper.
     *   - `adapter`: The adapter to use for the application (e.g., ExpressAdapter).
     *   - `port`: The port on which the application will run.
     *   - `options`: Additional options for the application.
     *   - `onInit`: A callback function to execute during initialization.
     *   - `loaders`: An array of loaders to execute during the bootstrap process.
     *
     * @returns {Promise<T | undefined>} A promise that resolves to the started application instance,
     * or `undefined` if an alternative bootstrapper is used.
     */
    async startApplication<T extends INestApplication = INestApplication>(
        meta?: StartApplicationMeta<T>,
    ): Promise<T> {
        return await this.start<T>(
            this.getApplicationBootstrapper<T>(meta),
        );
    }

    /**
     * Starts the microservice by initializing and invoking the appropriate microservice bootstrapper.
     *
     * @template T - The type of the microservice options, extending `NestMicroserviceOptions`.
     * @param {StartMicroserviceMeta<T>} [meta] - Optional metadata for configuring the microservice bootstrapper.
     *   - `options`: Additional options for the microservice.
     *   - `onInit`: A callback function to execute during initialization.
     *   - `loaders`: An array of loaders to execute during the bootstrap process.
     *
     * @returns {Promise<INestMicroservice | undefined>} A promise that resolves to the started microservice instance,
     * or `undefined` if an alternative bootstrapper is used.
     */
    async startMicroservice<T extends NestMicroserviceOptions & object = NestMicroserviceOptions>(
        meta?: StartMicroserviceMeta<T>,
    ): Promise<INestMicroservice> {
        return await this.start<INestMicroservice>(
            this.getMicroserviceBootstrapper<T>(meta),
        );
    }

    protected getApplicationBootstrapper<T extends INestApplication = INestApplication>(
        meta?: StartApplicationMeta<T>,
    ) {
        return new ApplicationBootstrapper<T>({ module: this.module, ...meta });
    }

    protected getMicroserviceBootstrapper<T extends NestMicroserviceOptions & object = NestMicroserviceOptions>(
        meta?: StartMicroserviceMeta<T>,
    ) {
        return new MicroserviceBootstrapper<T>({ module: this.module, ...meta });
    }

    protected getManagementBootstrapper() {
        return new ManagementBootstrapper({ module: this.module });
    }

    protected isManagementBootstrapperApplicable() {
        return process.argv.includes(COMMAND_ARG);
    }

    protected async start<T extends INestApplicationContext>(bootstrapper: BaseBootstrapper<T>): Promise<T> {
        for (const altBootstrapper of this.altBootstrappers) {
            if (altBootstrapper.isApplicable) {
                await altBootstrapper.bootstrapper.start();
                return;
            }
        }

        return bootstrapper.start();
    }
}
