import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import {
    Command,
    Handler,
    CommandOptions,
    HandlerOptions,
    CliArgumentOptions,
} from './management.interfaces';
import {
    COMMAND_METADATA_NAME,
    HANDLER_METADATA_NAME,
    CLI_ARGUMENTS_METADATA_NAME,
} from './management.constants';

@Injectable()
export class CommandsScanner {
    constructor(
        private readonly reflector: Reflector,
        private readonly modulesContainer: ModulesContainer,
        private readonly metadataScanner: MetadataScanner,
    ) {}

    scanCommands(): Set<Command> {
        const commands = new Set<Command>();

        const modules = [...this.modulesContainer.values()];

        for (const module of modules) {
            for (const provider of module.providers.values()) {
                const { metatype } = provider;

                if (typeof metatype !== 'function') {
                    continue;
                }

                if (!provider.instance) {
                    continue;
                }

                const instance = provider.instance;
                const prototype = Object.getPrototypeOf(instance);

                const commandOptions = this.reflector.get<CommandOptions>(
                    COMMAND_METADATA_NAME, instance.constructor,
                );

                if (!commandOptions) {
                    continue;
                }

                commands.add({
                    instance,
                    name: commandOptions.name,
                    description: commandOptions.description,
                    handlers: this.getCommandHandlers(instance, prototype),
                });
            }
        }

        return commands;
    }

    private getCommandHandlers(instance: any, prototype: any): Handler[] {
        return this.metadataScanner.scanFromPrototype(instance, prototype, name => {
                const handlerOptions = this.reflector.get<HandlerOptions>(
                    HANDLER_METADATA_NAME, instance[name],
                );

                if (!handlerOptions) {
                    return;
                }

                const argumentsOptions = this.reflector.get<CliArgumentOptions[]>(
                    CLI_ARGUMENTS_METADATA_NAME, instance[name],
                ) || [];

                const handlerArguments = argumentsOptions.map(option => {
                    return {
                        name: option.name,
                        description: option.description,
                        parse: option.parse,
                        defaultValue: option.defaultValue,
                        optional: option.optional,
                    };
                });

                return {
                    methodName: name,
                    shortcut: handlerOptions.shortcut,
                    description: handlerOptions.description,
                    arguments: handlerArguments,
                };
            },
        );
    }
}
