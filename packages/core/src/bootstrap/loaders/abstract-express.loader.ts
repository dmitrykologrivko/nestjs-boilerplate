import { INestApplication, Logger } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { BaseBootstrapperLoader } from '../base-bootstrapper.loader';

export abstract class AbstractExpressLoader extends BaseBootstrapperLoader<INestApplication> {
    constructor(
        protected readonly context: string,
    ) {
        super();
    }

    async load(container: INestApplication): Promise<void> {
        const adapterType = container.getHttpAdapter().getType();
        if (adapterType !== 'express') {
            Logger.error(
                `To use "${this.context}" you need express http adapter. The current http adapter is ${adapterType}`,
            );
            process.exit(1);
        }
    }

    protected loadExpress() {
        return loadPackage('express', this.context, () =>
            require('express')
        );
    }
}
