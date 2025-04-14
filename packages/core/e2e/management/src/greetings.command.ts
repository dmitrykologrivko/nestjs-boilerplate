import { Logger } from '@nestjs/common';
import {
    Command,
    DefaultHandler,
    Handler,
    CliArgument,
} from '../../../src/management/management.decorators';

@Command({ name: 'greetings' })
export class GreetingsCommand {
    @DefaultHandler()
    defaultHandler(@CliArgument({ name: 'nickname' }) nickname: string) {
        Logger.log(`Hello ${nickname}!`);
    }

    @Handler({ shortcut: 'person' })
    handler(
        @CliArgument({ name: 'firstName' }) firstName: string,
        @CliArgument({ name: 'lastName' }) lastName: string,
    ) {
        Logger.log(`Hello ${firstName} ${lastName}!`);
    }
}
