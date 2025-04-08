import { Logger } from '@nestjs/common';
import {
    Command,
    DefaultHandler,
    CliArgument,
} from '../../../src/management/management.decorators';

@Command({ name: 'greetings' })
export class GreetingsCommand {
    @DefaultHandler()
    handler(@CliArgument({ name: 'name' }) name: string) {
        Logger.log(`Hello ${name}!`);
    }
}
