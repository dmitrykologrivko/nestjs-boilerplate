import 'reflect-metadata';
import {
    SetMetadata,
    Injectable,
    applyDecorators,
} from '@nestjs/common';
import {
    CommandOptions,
    HandlerOptions,
    CliArgumentOptions,
} from './management.interfaces';
import {
    COMMAND_METADATA_NAME,
    HANDLER_METADATA_NAME,
    HANDLER_DEFAULT_NAME,
    CLI_ARGUMENTS_METADATA_NAME,
} from './management.constants';

export function Command(options: CommandOptions) {
    return applyDecorators(
        SetMetadata(COMMAND_METADATA_NAME, options),
        Injectable(),
    );
}

export function Handler(options: HandlerOptions) {
    return SetMetadata(HANDLER_METADATA_NAME, options);
}

export function DefaultHandler() {
    return Handler({ shortcut: HANDLER_DEFAULT_NAME });
}

export function CliArgument(options: CliArgumentOptions) {
    return (target: any, key: string | symbol, _: number) => {
        const args: CliArgumentOptions[] = Reflect.getMetadata(
            CLI_ARGUMENTS_METADATA_NAME,
            target[key],
        ) || [];

        SetMetadata(
            CLI_ARGUMENTS_METADATA_NAME, [options, ...args],
        )(
            target, key, Object.getOwnPropertyDescriptor(target, key),
        );
    };
}
