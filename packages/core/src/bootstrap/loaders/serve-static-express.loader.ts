import { INestApplication } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { BaseBootstrapperLoader } from '../base-bootstrapper.loader';

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

export class ServeStaticExpressLoader extends BaseBootstrapperLoader<INestApplication> {
    constructor(
        protected rootPath: string,
        protected url: string,
        protected options?: ServiceStaticOptions,
    ) {
        super();
    }

    async load(container: INestApplication): Promise<void> {
        const express = loadPackage('express', 'StaticExpressLoader', () =>
            require('express')
        );

        container.use(
            this.url,
            express.static(this.rootPath, this.options),
        );
    }
}
