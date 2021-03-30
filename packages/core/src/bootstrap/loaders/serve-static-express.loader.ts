import { INestApplication } from '@nestjs/common';
import { AbstractExpressLoader } from './abstract-express.loader';

/**
 * Express service static middleware options
 * http://expressjs.com/en/resources/middleware/serve-static.html
 */
export interface ServiceStaticOptions {

    acceptRanges?: boolean;

    cacheControl?: boolean;

    dotfiles?: string;

    etag?: boolean;

    fallthrough?: boolean;

    extensions?: string[];

    immutable?: boolean;

    index?: boolean | string | string[];

    lastModified?: boolean;

    maxAge?: number | string;

    redirect?: boolean;

    setHeaders?: (res: any, path: string, stat: any) => any;
}

export class ServeStaticExpressLoader extends AbstractExpressLoader {
    constructor(
        protected rootPath: string,
        protected url: string,
        protected options?: ServiceStaticOptions,
    ) {
        super('ServeStaticExpressLoader');
    }

    async load(container: INestApplication): Promise<void> {
        await super.load(container);

        const express = this.loadExpress();

        container.use(
            this.url,
            express.static(this.rootPath, this.options),
        );
    }
}
