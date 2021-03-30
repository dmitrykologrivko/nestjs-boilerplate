# Bootstrap

NestJS Boilerplate defines helpful classes and methods for bootstrapping your application or microservice.

## Bootstrapping Application

To start your application you can use `Bootstrap` class from `@nestjs-boilerplate/core` package.
By default, function `startApplication` runs web server on 8000 port but if provided `--command` arg then
runs management command. The main application module is required to be provided.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startApplication()
    .then();
```

If you want to additionally configure application then you need to provide one of the following: `options` object,
`onCustomInit` function, `loaders` array, or you can combine all of them. (see Bootstrapper Meta section)

```typescript
import { Bootstrap, NunjucksExpressLoader } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startApplication({
        options: {
            cors: true,
        },
        onCustomInit: async (container: INestApplication) => {
            container.setGlobalPrefix('api');
        },
        loaders: [new NunjucksExpressLoader()],
    })
    .then();
```

By default, Nest makes use of the Express framework, as an alternative you can use Fastify or other compatible
libraries. (see [official docs](https://docs.nestjs.com/techniques/performance#performance-fastify))
The appropriate adapter should be provided with the part of meta options for `startApplication` function.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startApplication<NestFastifyApplication>({
        adapter: new FastifyAdapter(),
    })
    .then();
```

## Bootstrapping Microservice

To start your microservice you can use `Bootstrap` class from `@nestjs-boilerplate/core` package.
By default, function `startMicroservice` runs microservice using the TCP transport layer but if provided `--command`
arg then runs management command. The main application module is required to be provided, also `@nestjs/microservices`
package is required to be installed.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startMicroservice()
    .then();
```

If you want to additionally configure microservice then you need to provide one of the following: `options` object,
`onCustomInit` function, `loaders` array, or you can combine all of them. (see Bootstrapper Meta section)

```typescript
import { Bootstrap, NunjucksExpressLoader } from '@nestjs-boilerplate/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startMicroservice<MicroserviceOptions>({
        options: {
            transport: Transport.TCP,
        },
    })
    .then();
```

## Base Bootstrapper

Bootstrapper is a class that contains a logic on how configure and start Nest application or microservice.
You can implement your own bootstrapper. All of you need is to extend `BaseBootstrapper` class and implement
`createContainer` and `onStart` methods.

Example of implementation simple server bootstrapper:

```typescript
import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseBootstrapper } from '@nestjs-boilerplate/core';

export class ServerBootstrapper extends BaseBootstrapper<NestExpressApplication, NestApplicationOptions> {

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
import { ServerBootstrapper } from './server.boostrapper';
import { AppModule } from './app.module';

new ServerBootstrapper({ module: AppModule })
    .start()
    .then(() => console.log('Server is started'));
```

Method `start` calls bootstrapper methods in the next flow:
1. `createContainer` creates Nest application container
2. `onInit` does initial application setup related to the bootstrapper, calls bootstrap loaders
3. `onCustomInit` does custom initial application setup related to the bootstrapper
4. `onStart` runs the logic of starting application

### Bootstrapper Meta

Each bootstrapper needs to provide `BootstrapperMeta` in the constructor.\
`module` is the main application module\
`options` optional Nest application configuration\
`onCustomInit` function which allows doing additional configure of application\
`loaders` array of the bootstrapper loaders

## Base Bootstrapper Loader

Bootstrapper Loader is a class that contains pre-defined logic of the application configuration. You can implement
your own bootstrapper loader. All of you need is to extend `BaseBootstrapperLoader` class and implement `load` method.

Example of implementation simple template bootstrapper loader:

```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseBootstrapperLoader } from '@nestjs-boilerplate/core';

export class TemplateExpressLoader extends BaseBootstrapperLoader<NestExpressApplication> {
    constructor(
        protected readonly staticAssetsDir: string,
        protected readonly baseViewsDir: string,
    ) {
        super('NunjucksExpressLoader');
    }

    async load(container: NestExpressApplication): Promise<void> {
        app.useStaticAssets(this.staticAssetsDir);
        app.setBaseViewsDir(this.baseViewsDir);
        app.setViewEngine('hbs');
    }
}
```

Using bootstrapper loader:

```typescript
import { join } from 'path';
import { ServerBootstrapper } from './server.boostrapper';
import { TemplateExpressLoader } from './template-express.loader';
import { AppModule } from './app.module';

const staticAssetsDir = join(__dirname, '..', 'public');
const baseViewsDir = join(__dirname, '..', 'views');

new ServerBootstrapper({
        module: AppModule,
        loaders: [new TemplateExpressLoader(staticAssetsDir, baseViewsDir)],
    })
    .start()
    .then(() => console.log('Server is started'));
```

## Build-in bootstrappers and loaders

NestJS Boilerplate contains build-in bootstrappers such as:\
`ApplicationBootstrapper` implements logic of running Nest application as web server.\
`MicroserviceBootstrapper` implements logic of running Nest application as microservice.\
`ManagementBootstrapper` implements logic of running Nest application for handling management commands.

NestJS Boilerplate contains build-in bootstrapper loaders such as:\
`NunjucksExpressLoader` implements configure logic of nunjucks template library and express application.\
`ServeStaticExpressLoader` implements configure logic of serving static files for express application.