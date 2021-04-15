# Bootstrap

NestJS Boilerplate defines a concept of using special util classes for bootstrapping your application or microservice.\
`Bootstrapper` is a class that contains a logic on how configure and start Nest application or microservice.\
`Loader` is a class that contains pre-defined logic of the application configuration. It is supposed to be used
together with the bootstrapper. Allows you to simplify application configuration and exclude the repetition
of the configuration logic between different projects.

## Bootstrapping Application

NestJS Boilerplate contains build-in `ApplicationBootstrapper` for running Nest application as web server.
This bootstrapper by default runs web server on 8000 port. The main application module is required to be provided.

```typescript
import {ApplicationBootstrapper} from 'packages/core/dist/index';
import {AppModule} from './app.module';

new ApplicationBootstrapper({module: AppModule})
    .start();
```

If you want to additionally configure application then you need to provide one of the following: `options` object,
`onInit` function, `loaders` array, or you can combine all of them. (see Bootstrapper Meta section)

```typescript
import { ApplicationBootstrapper, NunjucksExpressLoader } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new ApplicationBootstrapper({
        module: AppModule,
        options: {
            cors: true,
        },
        onInit: async (container: INestApplication) => {
            container.setGlobalPrefix('api');
        },
        loaders: [new NunjucksExpressLoader()],
    })
    .start();
```

By default, Nest makes use of the Express framework, as an alternative you can use Fastify or other compatible
libraries. (see [official docs](https://docs.nestjs.com/techniques/performance#performance-fastify))
The appropriate adapter should be provided with the part of meta options.

```typescript
import { ApplicationBootstrapper } from '@nestjs-boilerplate/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

new ApplicationBootstrapper<NestFastifyApplication>({
        module: AppModule,
        adapter: new FastifyAdapter(),
    })
    .start();
```

Additional way to start your application you need to use `Bootstrap` class from `@nestjs-boilerplate/core` package.
Function `startApplication` by default runs web server on 8000 port or runs one of alternative bootstrappers,
for example if provided `--command` arg then runs management command. The main application module is required
to be provided. You can provide the same configuration options as for `ApplicationBootstrapper` because it uses
this bootstrapper under the hood.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startApplication();
```

This is a more declarative way to declare your application bootstrapping logic if it requires additional
alternative bootstrappers, for example, for processing cron tasks or management commands.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';
import { CronBootstappeer } from './cron.bootstrapper';

new Bootstrap(
        AppModule,
        [{
            bootstrapper: new CronBootstappeer(),
            isApplicable: process.argv.includes('cron'),
        }],
    )
    .startApplication();
```

## Bootstrapping Microservice

NestJS Boilerplate contains build-in `MicroserviceBootstrapper` for running microservice.
This bootstrapper by default runs microservice using the TCP transport layer. The main application module
is required to be provided, also `@nestjs/microservices` package is required to be installed.

```typescript
import { MicroserviceBootstrapper } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new MicroserviceBootstrapper({ module: AppModule })
    .start();
```

If you want to additionally configure microservice then you need to provide one of the following: `options` object,
`onInit` function, `loaders` array, or you can combine all of them. (see Bootstrapper Meta section)

```typescript
import { Transport } from '@nestjs/microservices';
import { MicroserviceBootstrapper } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new MicroserviceBootstrapper({
        module: AppModule,
        options: {
            transport: Transport.TCP,
        },
    })
    .start();
```

Additional way to start your microservice you need to use Bootstrap class from @nestjs-boilerplate/core package.
Function `startMicroservice` that by default runs microservice using the TCP transport layer or runs
one of alternative bootstrappers, for example if provided `--command` arg then runs management command.
The main application module is required to be provided, also `@nestjs/microservices`
package is required to be installed. You can provide the same configuration options as for `MicroserviceBootstrapper`
because it uses this bootstrapper under the hood.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startMicroservice();
```

This is a more declarative way to declare your application bootstrapping logic if it requires additional alternative
bootstrappers, for example, for processing cron tasks or management commands.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';
import { CronBootstappeer } from './cron.bootstrapper';

new Bootstrap(
        AppModule,
        [{
            bootstrapper: new CronBootstappeer(),
            isApplicable: process.argv.includes('cron'),
        }],
    )
    .startMicroservice();
```

## Bootstrapping Standalone Application

According to the [Nest documentation](https://docs.nestjs.com/standalone-applications):
```
There are several ways of mounting a Nest application. You can create a web app, a microservice or
just a bare Nest standalone application (without any network listeners). The Nest standalone application is a wrapper
around the Nest IoC container, which holds all instantiated classes. We can obtain a reference to any existing
instance from within any imported module directly using the standalone application object.
Thus, you can take advantage of the Nest framework anywhere, including, for example, scripted CRON jobs.
You can even build a CLI on top of it.
```

A good example here is build-in `ManagementBootstrapper` which allows running Nest application for handling
management commands.

```typescript
import { ManagementBootstrapper } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new ManagementBootstrapper({ module: AppModule })
    .start();
```

Depending on your needs can implement and run your own bootstrapper for standalone applications.

To have more declarative form of using standalone applications as well as your Nest application or microservice,
please use `Bootstrap` class from `@nestjs-boilerplate/core` package allows you to set alternative
bootstrappers and choose when need to use them depending on certain conditions.

## Base Bootstrapper

You can implement your own bootstrapper. All of you need is to extend `BaseBootstrapper` class and implement
`createContainer` and `onStart` methods.

Example of implementation simple application bootstrapper:

```typescript
import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseBootstrapper } from '@nestjs-boilerplate/core';

export class ApplicationBootstrapper extends BaseBootstrapper<NestExpressApplication, NestApplicationOptions> {

    protected async createContainer(): Promise<NestExpressApplication> {
        return NestFactory.create(this.meta.module, this.meta.options);
    }

    protected async onStart(container: NestExpressApplication): Promise<void> {
        await container.listen(8000);
    }
}
```

Using bootstrapper:

```typescript
import { ApplicationBootstrapper } from './application.boostrapper';
import { AppModule } from './app.module';

new ApplicationBootstrapper({ module: AppModule })
    .start();
```

### Bootstrapper lifecycle

Method `start` calls bootstrapper methods in the next flow:
1. `createContainer` creates Nest application container
2. `onInit` does initial application setup related to the bootstrapper
3. `meta.onInit` does custom initial application setup related to the bootstrapper
4. `runLoaders` executes provided loaders
5. `onStart` runs the logic of starting application

### Bootstrapper Meta

Each bootstrapper needs to provide `BootstrapperMeta` in the constructor.\
`module` is the main application module\
`options` optional Nest application configuration\
`onInit` function which allows doing additional configure of application\
`loaders` array of the bootstrapper loaders

## Base Loader

You can implement your own loader. All of you need is to extend `BaseLoader` class and implement `load` method.

Example of implementation simple template loader:

```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseLoader } from '@nestjs-boilerplate/core';

export class TemplateExpressLoader extends BaseLoader<NestExpressApplication> {
    constructor(
        protected readonly staticAssetsDir: string,
        protected readonly baseViewsDir: string,
    ) {
        super();
    }

    async load(container: NestExpressApplication): Promise<void> {
        container.useStaticAssets(this.staticAssetsDir);
        container.setBaseViewsDir(this.baseViewsDir);
        container.setViewEngine('hbs');
    }
}
```

Using template loader:

```typescript
import { join } from 'path';
import { ApplicationBootstrapper } from '@nestjs-boilerplate/core';
import { TemplateExpressLoader } from './template-express.loader';
import { AppModule } from './app.module';

const staticAssetsDir = join(__dirname, '..', 'public');
const baseViewsDir = join(__dirname, '..', 'views');

new ApplicationBootstrapper({
        module: AppModule,
        loaders: [new TemplateExpressLoader(staticAssetsDir, baseViewsDir)],
    })
    .start();
```

NestJS Boilerplate contains build-in loaders such as:\
`NunjucksExpressLoader` implements configure logic of nunjucks template library and Express HTTP provider.\
`ServeStaticExpressLoader` implements configure logic of serving static files for Express HTTP provider.