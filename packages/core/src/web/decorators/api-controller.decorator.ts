import { Controller, ControllerOptions } from '@nestjs/common';
import { isEmpty } from '../../utils/precondition.utils';

export interface ApiControllerOptions extends ControllerOptions {
    rootPrefix?: string;
    versionNumber?: number;
    versionPrefix?: string;
    additionalPrefixes?: string[];
}

export function ApiController(prefixOrOptions: string | ApiControllerOptions) {
    if (!prefixOrOptions) {
        return Controller();
    }

    if (typeof prefixOrOptions === 'string') {
        return Controller({ path: `api/${prefixOrOptions}` });
    }

    const rootPrefix = `${prefixOrOptions.rootPrefix || 'api'}/`;

    const versionPrefix = !prefixOrOptions.versionNumber
        ? ''
        : `${prefixOrOptions.versionPrefix ? `${prefixOrOptions.versionPrefix}${prefixOrOptions.versionNumber}` : `v${prefixOrOptions.versionNumber}`}/`;

    const additionalPrefixes = isEmpty(prefixOrOptions.additionalPrefixes)
        ? ''
        : `${prefixOrOptions.additionalPrefixes.join('/')}/`;

    const prefix = !prefixOrOptions.path
        ? ''
        : prefixOrOptions.path;

    prefixOrOptions.path = `${rootPrefix}${versionPrefix}${additionalPrefixes}${prefix}`;

    return Controller(prefixOrOptions);
}
