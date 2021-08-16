# NestJS Boilerplate

NestJS Boilerplate is an open-source high-level framework for [NestJS](https://github.com/nestjs/nest) applications.
It takes it up a notch by making it possible to solve repeatable tasks with less coding. It provides an architectural
model based on Domain Driven Design and contains a variety of extra tools for a quick start developing NestJS
applications. The NestJS Boilerplate aims to follow the principle of pluggable modules to extend functionality and
less repeating common code from project to project. Inspired by Spring Framework, AspNet Boilerplate and Django.

## Package description

Testing is a package that provides additional tools for testing NestJS Boilerplate applications.

## Install

`$ npm install @nestjs-boilerplate@testing --save-dev`

## Test bootstrappers

NestJS Boilerplate defines a concept of using special util classes for bootstrapping your application or microservice.
See more information [here](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/core/docs/bootstrap.md).

Testing package provides the following classes to bootstrap and starts an instance of Nest application or microservice in tests:
* `BaseTestBootstrapper` class is the base class for other derived test bootstrappers. It extends `BaseBootstrapper` class 
and creates under the hood the instance of `TestingModule` from `@nestjs/testing` package which can be used in 
other derived test bootstrappers.
* `TestApplicationBootstrapper` class configures and creates Nest application based on the instance of `TestingModule`. 
It extends `BaseTestBootstrapper` class.
* `TestMicroserviceBootstrapper` class configures and creates Nest microservice based on the instance of `TestingModule`.
It extends `BaseTestBootstrapper` class.
* `TestBootstrap` class provides additional way to start Nest application or microservice. It uses
`TestApplicationBootstrapper` class or `TestMicroserviceBootstrapper` class accordingly to perform bootstrapping.

Let's use test bootsrapper to bootstrap and start Nest application in tests.

```typescript
import * as request from 'supertest';
import { TestBootstrap } from '@nestjs-boilerplate/testing';
import { AppModule } from './app.module';

describe('NoteController (e2e)', () => {
    let app;

    beforeAll(async () => {
        app = await new TestBootstrap(AppModule)
            .startApplication();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/notes (GET)', () => {
        it('should return success response', () => {
            return request(app.getHttpServer())
                .get('/api/notes')
                .expect(200);
        });
    });
});
```

## Test mail

In some unit/e2e tests, we need to check that an email message is sent but at the same time, we need to make sure that 
we do not send any emails outside.

Testing package provides the following classes to mock sending email:
* `ConsoleMailService`
* `MemoryMailService`
* `NullMailService`

```typescript

```

```typescript
import * as request from 'supertest';
import { TestingModuleBuilder } from '@nestjs/testing';
import { BaseMailService } from '@nestjs-boilerplate/core';
import { TestBootstrap, TestMailModule, MemoryMailService } from '@nestjs-boilerplate/testing';
import { AppModule } from './app.module';

describe('PostController (e2e)', () => {
    let mailService;
    let app;

    beforeAll(async () => {
        app = await new TestBootstrap(AppModule)
            .startApplication({
                imports: [TestMailModule],
                onCreateTestingModule: (builder: TestingModuleBuilder) => {
                    return builder.overrideProvider(BaseMailService).
                }
            });

        
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/posts/id/publish (POST)', () => {
        it('should publish post and send email', async () => {
            request(app.getHttpServer())
                .post('/api/notes/1/publish')
                .expect(200);

            
        });
    });
});
```

## Keep in touch

Dmitry Kologrivko - dmitrykologrivko@gmail.com

## License

[MIT LICENSE](./LICENSE)
