# Management

Management commands are commands that can be run under a command shell. Can be useful for running some action once 
or periodically. For example, management commands can be used for maintenance actions or to give more convenient 
admin tooling.

## Basic example

Basically a management command is a class wrapped by `Command` decorator. The command must have a handler method 
wrapped by `Handler` or `DefaultHandler` decorators.

```typescript
import { Logger } from '@nestjs/common';
import { Command, DefaultHandler } from '@nestjs-boilerplate/core';

@Command({
    name: 'current-date',
    description: 'Displays current date',
})
export class CurrentDateCommand {
    
    @DefaultHandler()
    handler() {
        Logger.debug(new Date());
    }
}
```

**Note:** Handler method can return Promise for async actions.

Your commands can have access to the application services, so you can inject any service registered in the Nest
container and execute database operations, interact with application resources, etc. 

Do not forget to register your command as a provider of your module.

```typescript
import { Module } from '@nestjs/common';
import { CoreModule, MailModule } from '@nestjs-boilerplate/core';
import { AppController } from './app.controller';
import { CurrentDateCommand } from './current-date.command';

@Module({
    imports: [CoreModule.forRoot()],
    providers: [CurrentDateCommand],
    controllers: [AppController],
})
export class AppModule {}
```

To run the registered command use `--command` argument and provide a name of command.

```shell
npm run start --command current-date
```

## Command arguments

You can provide arguments for the command handlers, define usual function arguments and wrap them by `CliArgument` 
decorator. 

```typescript
import { Logger } from '@nestjs/common';
import { Command, DefaultHandler, CliArgument } from '@nestjs-boilerplate/core';

@Command({
    name: 'sum',
    description: 'Displays sum of two numbers',
})
export class SumCommand {
    
    @DefaultHandler()
    handler(
        @CliArgument({
            name: 'a',
            description: 'First argument',
        })
        a: number,
        @CliArgument({
            name: 'b',
            description: 'Second argument',
        })
        b: number,
    ) {
        Logger.debug(`${a} + ${b} = ${a + b}`);
    }
}
```

**`CliArgument` decorator has the following options:**\
`name` name of argument that will be used in CLI shell.\
`description` argument description.\
`parse` function to parse inputted value.\
`defaultValue` default value if argument was not provided.\
`optional` current argument can be optional.

To run command with the arguments use the following format:

```shell
npm run start --command sum -- --a 2 --b 2
```

## Multiple command handlers

The command can have multiple handlers for different actions. Each handler must have a name (shortcut).

```typescript
import { Logger } from '@nestjs/common';
import { Command, Handler, CliArgument } from '@nestjs-boilerplate/core';

@Command({
    name: 'calc',
    description: 'Makes simple calculation operations and displays result',
})
export class CalculationCommand {
    
    @Handler({
        shortcut: 'sum',
        description: 'Displays sum of two numbers',
    })
    sum(
        @CliArgument({
            name: 'a',
            description: 'First argument',
        })
        a: number,
        @CliArgument({
            name: 'b',
            description: 'Second argument',
        })
        b: number,
    ) {
        Logger.debug(`${a} + ${b} = ${a + b}`);
    }

    @Handler({
        shortcut: 'sub',
        description: 'Displays subtraction of two numbers',
    })
    sub(
        @CliArgument({
            name: 'a',
            description: 'First argument',
        })
            a: number,
        @CliArgument({
            name: 'b',
            description: 'Second argument',
        })
            b: number,
    ) {
        Logger.debug(`${a} - ${b} = ${a - b}`);
    }
}
```

To run command for concrete action use the following format `command_name:shortcut`, for example:

```shell
npm run start --command calc:sum -- --a 2 --b 2
```