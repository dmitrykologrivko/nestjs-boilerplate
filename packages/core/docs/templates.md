# Templates

NestJS Boilerplate has an abstract template engine functionality to render HTML views. It means that you can implement
connection of your favorite template engine if you want. By default, NestJS Boilerplate provides ready solution of using
[Nunjucks](https://mozilla.github.io/nunjucks/) template engine service.\
Nunjucks is fast, extensible and powerful template engine for JavaScript. Heavily inspired by
[jinja2](http://jinja.pocoo.org/).

**Note:** The following examples in this documentation are implemented using Nunjucks templates.

## Template rendering

To start template rendering you need to create templates folder and template file. Let's create `templates` folder
under the root of the project and `index.html` file.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Home</title>
    </head>
    <body>
        <p>Template rendering works! It is now {{ time }}}</p>
    </body>
</html>
```

Also, you need to register path to the folder with templates in the application module.

```typescript
import { join } from 'path';
import { Module } from '@nestjs/common';
import { CoreModule } from 'packages/core/dist/index';
import { AppController } from './app.controller';

@Module({
   imports: [
      CoreModule.forRoot({
         template: {
            path: join(__dirname, '..', 'templates'),
         },
      }),
   ],
   controllers: [AppController],
})
export class AppModule {
}
```

As the final step, you need to inject `BaseTemplateService` into your application controller and use `render` method
in the controller action to provide template name and context object.

```typescript
import { Get, Controller } from '@nestjs/common';
import { BaseTemplateService } from '@nestjs-boilerplate/core';

@Controller()
export class AppController {
    constructor(
        protected readonly templateService: BaseTemplateService,
    ) {}

    @Get()
    async index() {
        return this.templateService.render('index.html', { time: new Date() });
    }
}
```

You can inject template service into another service to render HTML into a string. A good example here of using this
for sending by emails.

```typescript
import { Injectable } from '@nestjs/common';
import { BaseTemplateService } from '@nestjs-boilerplate/core';
import { EmailService } from './email.service';

@Injectable()
export class WelcomeService {
    constructor(
        protected readonly templateService: BaseTemplateService,
        protected readonly emailService: EmailService,
    ) {}

    async sendWelcomeEmail(username: string) {
        const html = await this.templateService.render('welcome.html', { username });
        await this.emailService.sendEmail('test@example.com', html);
    }
}
```

**Note:** Template engine can be overridden in the probject and in this case `BaseTemplateService` service will have
another template engine language. If you still want to use Nunjucks then you can inject `NunjucksService` instead.

## Setup with HTTP provider

To extend your application you can attach the template engine to the HTTP provider. Nest, by default, makes use of
the Express library under the hood but if you want to set up with another HTTP provider you still can do this by
implementing the corresponding loaders or setup in custom init function
(see [Nest example](https://docs.nestjs.com/techniques/mvc#fastify) for HBS and Fastify).

```typescript
import { join } from 'path';
import {
    Bootstrap,
    NunjucksExpressLoader,
    ServeStaticExpressLoader,
} from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

new Bootstrap(AppModule)
    .startApplication({
        loaders: [
            new NunjucksExpressLoader(),
            new ServeStaticExpressLoader(join(__dirname, '..', 'public'), '/public'),
        ],
    });
```

`NunjucksExpressLoader` will attach Nunjucks to the express HTTP provider as template engine by default.\
`ServeStaticExpressLoader` will set content of the public folder to be served under /public url as static content.

Now you can use `Render` decorator from `@nestjs/common` package for controller actions.

```typescript
import { Get, Controller, Render } from '@nestjs/common';
import { BaseTemplateService } from '@nestjs-boilerplate/core';

@Controller()
export class AppController {

    @Render('index.html')
    @Get()
    index() {
        return { time: new Date() };
    }
}
```

Alternatively you can use the express response object to render templates. It can be helpful if you for example
need to dynamically decide which template to render.

```typescript
import { Get, Controller, Res } from '@nestjs/common';
import { Response } from 'express';
import { BaseTemplateService } from '@nestjs-boilerplate/core';

@Controller()
export class AppController {

    @Get()
    index(@Response() res: Response) {
        return res.render('index.html', { time: new Date() });
    }
}
```

## Connecting another template engine

As NestJS Boilerplate has an abstract template engine functionality to render HTML views, you can implement
a connection of your favorite template engine. For example, if you prefer Handlebars instead of Nunjucks or
Nunjucks does not cover your needs.

A few major points to know:
1. NestJS Boilerplate is designed to have more than one template folders
2. If your template engine does not support caching or file loading then you need to implement it by yourself.

Let's try to implement connection of the HBS library with the Express HTTP provider.

First, install required libraries.

```
npm install --save hbs && npm install --save-dev @types/hbs
```

Create token for a provider.

```typescript
export const HANDLEBARS_TOKEN = 'HANDLEBARS_TOKEN';
```

Create handlebars template service.

```typescript
import { Inject } from '@nestjs/common'
import {
    BaseTemplateService,
    InfrastructureService,
} from '@nestjs-boilerplate/core';
import { HANDLEBARS_TOKEN } from './handlebars.constants';
import { TemplateLoader } from './template-loader.util';

@InfrastructureService()
export class HandlebarService extends BaseTemplateService {
    constructor(
        @Inject(HANDLEBARS_TOKEN)
        protected readonly handlebars: any,
        protected readonly templateLoader: TemplateLoader,
    ) {
        super();
    }

    async render(template: string, context?: object): Promise<string> {
        return this.handlebars.compile(
            await this.templateLoader.getTemplate(template),
        )(context);
    }
}
```

**Note:** Handlebars does not support template loading and caching also HBS helper
support this only in Express middleware level. So for this library we need to develop our own template loader.
Implementation of `TemplateLoader` here is skipped, you are free to do it your way. To get list of templates folder
you can inject an array of strings by using `TEMPLATE_PATHS_TOKEN` token.

Create host module for handlebars service and make module global scoped.

```typescript
import * as hbs from 'hbs';
import { Module, Global } from '@nestjs/common';
import { HandlebarsService } from './handlebars.service';
import { HANDLEBARS_TOKEN } from './handlebars.constants';

const handlebarsProvider = {
    provide: HANDLEBARS_TOKEN,
    useValue: hbs.create(),
};

@Global()
@Module({
    providers: [
        handlebarsProvider,
        HandlebarsService,
    ],
    exports: [
        handlebarsProvider.provide,
        HandlebarsService,
    ],
})
export class HandlebarsModule {}
```

In the main application module we need to provide a path to templates folder and set `HandlebarsService` as a default
template service. Do not forget to import `HandlebarsModule`.

```typescript
import { join } from 'path';
import { Module } from '@nestjs/common';
import { CoreModule, TemplateModule } from '@nestjs-boilerplate/core';
import { AppController } from './app.controller';
import { HandlebarsModule } from './handlebars.module';
import { HandlebarService } from './handlebars.service';

@Module({
    imports: [
        CoreModule.forRoot({
            template: TemplateModule.forRoot<HandlebarsService>({
                path: join(__dirname, '..', 'templates'),
                service: HandlebarsService,
            }),
        }),
        HandlebarsModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
```

Additionally, we need to create a loader for the Express HTTP provider.

```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseLoader, TEMPLATE_PATHS_TOKEN } from '@nestjs-boilerplate/core';
import { HANDLEBARS_TOKEN } from './handlebars.constants';

export class HandlebarsExpressLoader extends BaseLoader<NestExpressApplication> {

    async load(container: NestExpressApplication): Promise<void> {
        container.engine('hbs', container.get(HANDLEBARS_TOKEN).__express);
        container.set('view engine', 'hbs');
        container.set('views', container.get(TEMPLATE_PATHS_TOKEN));
    }
}
```

Finally, we need to set `HandlebarsExpressLoader` for an application bootstrapper. Also, you can set up serving
static files by using `ServeStaticExpressLoader` loader.

```typescript
import { join } from 'path';
import {
    Bootstrap,
    ServeStaticExpressLoader,
} from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';
import { HandlebarsExpressLoader } from './handlebars-express.loader';

new Bootstrap(AppModule)
    .startApplication({
        loaders: [
            new HandlebarsExpressLoader(),
            new ServeStaticExpressLoader(join(__dirname, '..', 'public'), '/public'),
        ],
    });
```

## Template rendering in external packages

In cases when you want to split application logic by modules and distribute it as an independent external package,
you still can render templates in external packages.

The best ways to achieve this:
1. Use `BaseTemplateService` service or `Render` decorator or `res.render` method in the external package and
   provide template name and context object. Templates should be placed in the main project and written on
   the current application template engine language.
2. Templates can be placed in the external package and written on any template engine language. Path to the templates
   should be registered by using `TemplateModule.forFeature` method. Do not use `BaseTemplateService` service or
   `Render` decorator or `res.render` method in the external package because template engine is set up on the
   main project level it can be overridden. Inject in your services/controllers specific type of template engine,
   for example `NunjucksService` service. The name of templates should start with a prefix of the name of the external
   package to avoid duplication mistakes with the other packages or the main project.

## Nunjucks additional setup

If you need to add custom filters, custom extensions or global values then you can do this on the module init event.

```typescript
import { join } from 'path';
import { Environment } from 'nunjucks';
import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { CoreModule, TemplateModule, NUNJUCKS_TOKEN } from '@nestjs-boilerplate/core';
import { AppController } from './app.controller';

@Module({
    imports: [
        CoreModule.forRoot({
            template: TemplateModule.forRoot({
                path: join(__dirname, '..', 'templates'),
            }),
        }),
    ],
    controllers: [AppController],
})
export class AppModule implements OnModuleInit {
   constructor(
     @Inject(NUNJUCKS_TOKEN)
     protected nunjucks: Environment,
   ) {}

   onModuleInit(): any {
      nunjucks.addFilter('shorten', (str, count) => {
         return str.slice(0, count || 5);
      });
   }
}
```