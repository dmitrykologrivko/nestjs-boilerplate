import { Controller, ControllerOptions } from '@nestjs/common';
import { isEmpty } from '../../utils/precondition.utils';

export interface ApiControllerOptions extends ControllerOptions {
    useGlobalPrefix?: boolean;
    rootPrefix?: string;
    version?: number;
    versionPrefix?: string;
    additionalPrefixes?: string[];
}

export function ApiController(): ClassDecorator;

export function ApiController(prefix: string): ClassDecorator;

export function ApiController(options: ApiControllerOptions): ClassDecorator;

export function ApiController(prefixOrOptions?: string | ApiControllerOptions) {
    if (!prefixOrOptions) {
        return Controller();
    }

    if (typeof prefixOrOptions === 'string') {
        return Controller({ path: `api/${prefixOrOptions}` });
    }

    const rootPrefix = prefixOrOptions.useGlobalPrefix
        ? ''
        : `${prefixOrOptions.rootPrefix || 'api'}/`;

    const versionPrefix = !prefixOrOptions.version
        ? ''
        : `${prefixOrOptions.versionPrefix ? `${prefixOrOptions.versionPrefix}${prefixOrOptions.version}` : `v${prefixOrOptions.version}`}/`;

    const additionalPrefixes = isEmpty(prefixOrOptions.additionalPrefixes)
        ? ''
        : `${prefixOrOptions.additionalPrefixes.join('/')}/`;

    const prefix = !prefixOrOptions.path
        ? ''
        : prefixOrOptions.path;

    prefixOrOptions.path = `${rootPrefix}${versionPrefix}${additionalPrefixes}${prefix}`;

    return Controller(prefixOrOptions);
}
