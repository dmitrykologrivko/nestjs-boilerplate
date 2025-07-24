import { INestApplication, Logger } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { BaseLoader } from '../base.loader';

export abstract class AbstractExpressLoader extends BaseLoader<INestApplication> {
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
            this.abort();
        }
        return Promise.resolve();
    }

    protected loadExpress(): any {
        return loadPackage('express', this.context, () =>
            // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-return
            require('express')
        );
    }

    protected abort() {
        process.exit(1);
    }
}
