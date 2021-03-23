# Bootstrap

NestJS Boilerplate defines helpful classes and methods for bootstrapping your application.

## Bootstrapping Application

To simple start your application you can use function `bootstrapApplication` from `@nestjs-boilerplate/core` package.
This function wraps logic on running application in web server mode or management commands modes.
By default, runs web server on 8000 port but if provided `--command` arg then runs management command.
Main application module is required to be provided.

```typescript
import { bootstrapApplication } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

bootstrapApplication({ module: AppModule })
    .then();
```

If you want to use custom options for web server or additionally configure it then you need to provide
`options` object or `onCustomInit` function.

```typescript
import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

bootstrapApplication({
    module: AppModule,
    options: {
        cors: true,
    },
    onCustomInit: async (container: INestApplication) => {
        container.setGlobalPrefix('api');
    },
}).then();
```

## Base Bootstrapper

You can implement your own bootstrapper. All of you need is to extend `BaseBootstrapper` class and implement
`createContainer` and `onStart` methods.

Example of implementation simple server bootstrapper:

```typescript
import { NestFactory } from '@nestjs/core';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { BaseBootstrapper } from '@nestjs-boilerplate/core';

export class ServerBootstrapper extends BaseBootstrapper<INestApplication, NestApplicationOptions> {

    protected async createContainer(module: any, options: NestApplicationOptions): Promise<INestApplication> {
        return NestFactory.create(module, options);
    }

    protected async onStart(container: INestApplication): Promise<void> {
        await container.listen(8000);
    }
}
```

Using bootstrapper:

```typescript
import { ServerBootstrapper } from './server.boostrapper';
import { AppModule } from './app.module';

new ServerBootstrapper({ module: AppModule })
    .start()
    .then(() => console.log('Server is started'));
```

Method `start` calls bootstrapper methods in the next flow:
1. `createContainer` creates Nest application container
2. `onInit` does initial application setup related to the bootstrapper
3. `onCustomInit` does custom initial application setup related to the bootstrapper
4. `onStart` runs the logic of starting application

### Bootstrapper Meta

Each bootstrapper needs to provide `BootstrapperMeta` in the constructor.\
`Module` is the main application module\
`options` Nest application container options\
`onCustomInit` function which allows doing additional configure of application

## Build-in bootstrappers

NestJS Boilerplate contains build-in bootstrappers such as:\
`ServerBootstrapper` implements logic of running Nest application and starting web server.\
`ManagementBootstrapper` implements logic of running Nest application for handling management commands.