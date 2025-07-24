import * as minimist from 'minimist';
import { Injectable } from '@nestjs/common';
import { Fn } from '../utils/type.utils';
import { CommandsScanner } from './commands-scanner';
import { Command, Handler, CliArgument } from './management.interfaces';
import { HANDLER_DEFAULT_NAME } from './management.constants';

@Injectable()
export class ManagementService {
    constructor(private readonly scanner: CommandsScanner) {}

    async exec() {
        const args = minimist(this.getArguments());

        if (!args.command) {
            throw new Error('Command name is not provided! Please provide --command argument');
        }

        const [name, shortcut = HANDLER_DEFAULT_NAME] = (args.command as string).split(':');

        const command = this.findCommand(name);

        if (!command) {
            throw new Error(`Could not find "${name}" in registered commands`);
        }

        const handler = this.findHandler(command, shortcut);

        if (!handler) {
            throw new Error(`Handler "${shortcut}" is not registered in command "${name}"`);
        }

        await (command.instance[handler.methodName] as Fn)(...this.bindArguments(args, handler.arguments));
    }

    protected getArguments(): string[] {
        return process.argv.slice(2);
    }

    private findCommand(name: string): Command {
        const commands = this.scanner.scanCommands();

        for (const command of commands) {
            if (command.name === name) {
                return command;
            }
        }

        return null;
    }

    private findHandler(command: Command, shortcut: string): Handler {
        for (const handler of command.handlers) {
            if (handler.shortcut === shortcut) {
                return handler;
            }
        }

        return null;
    }

    private bindArguments(processArgs: any, handlerArgs: CliArgument[]): any[] {
        const methodArgs = [];

        for (const handlerArg of handlerArgs) {
            if (!processArgs[handlerArg.name] && !handlerArg.optional && !handlerArg.defaultValue) {
                throw new Error(`Missing required argument "${handlerArg.name}"`);
            }

            let methodArg = handlerArg.defaultValue;

            if (!processArgs[handlerArg.name] && handlerArg.optional) {
                methodArgs.push(methodArg);
                continue;
            }

            methodArg = handlerArg.parse
                ? handlerArg.parse(processArgs[handlerArg.name])
                : processArgs[handlerArg.name];

            methodArgs.push(methodArg);
        }

        return methodArgs;
    }
}
