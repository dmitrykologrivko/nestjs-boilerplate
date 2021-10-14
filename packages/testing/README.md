# NestJS Boilerplate

NestJS Boilerplate is an open-source high-level framework for [NestJS](https://github.com/nestjs/nest) applications.
It takes it up a notch by making it possible to solve repeatable tasks with less coding. It provides an architectural
model based on Domain Driven Design and contains a variety of extra tools for a quick start developing NestJS
applications. The NestJS Boilerplate aims to follow the principle of pluggable modules to extend functionality and
less repeating common code from project to project. Inspired by Spring Framework, AspNet Boilerplate and Django.

## Package description

Testing is a package that provides additional tools for testing NestJS Boilerplate applications.

## Install

### First

Install [core package.](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/core/docs/getting-started.md)

### Then

`$ npm install @nestjs-boilerplate/testing --save-dev`

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
* `ConsoleMailService` class allows redirecting emails to be print into the console.
* `MemoryMailService` class allows keeping emails in special `outbox` parameter to have access to a list of sent emails.
* `NullMailService` class that does nothing.

Let's override standard email service in tests.

```typescript
import * as request from 'supertest';
import { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { BaseMailService } from '@nestjs-boilerplate/core';
import { TestBootstrap, TestMailModule, MemoryMailService } from '@nestjs-boilerplate/testing';
import { AppModule } from './app.module';

describe('PostController (e2e)', () => {
    let mailService: MemoryMailService;
    let app;

    beforeAll(async () => {
        app = await new TestBootstrap(AppModule)
            .startApplication({
                testingMetadata: {
                    imports: [TestMailModule],
                },
                onCreateTestingModule: (builder: TestingModuleBuilder) => {
                    return builder
                        .overrideProvider(BaseMailService)
                        .useClass(MemoryMailService);
                },
                onTestingModuleCreated: (testingModule: TestingModule) => {
                    mailService = app.get<BaseMailService, MemoryMailService>(BaseMailService);
                },
            });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/posts/id/publish (POST)', () => {
        it('should publish post and send email', async () => {
            expect(mailService.outbox.length).toEqual(0);

            await request(app.getHttpServer())
                .post('/api/notes/1/publish')
                .expect(200);

            expect(mailService.outbox.length).toEqual(1);
        });
    });
});
```

## class-validator constraints

If you want to use custom constraints for class validation but you need to write a unit test, then there may be a problem.
class-validator library uses a dependency container by default to store/get the constraints. When you run the Nest 
application/microservice then NestJS Boilerplate automatically binds Nest container for class-validator.
It might work for e2e tests but not for unit tests when you do not run Nest application/microservice.

Testing package contains `createClassValidatorContainer` function which allows to create and bind container for 
class-validator. Thus for unit tests, you can use this function to achieve the possibility to register constraints.

```typescript
import { ClassValidator } from '@nestjs-boilerplate/core';
import { SimpleIocContainer, createClassValidatorContainer } from '@nestjs-boilerplate/testing';
import { UserVerificationService } from 'user-verification.service';
import { UsernameUniqueConstraint } from 'username-unique.constraint';
import { UserDto } from './user.dto';

describe('UserDto', () => {
    let container: SimpleIocContainer;

    beforeEach(async () => {
        const userVerificationService = new UserVerificationService();
        const usernameUniqueConstraint = new UsernameUniqueConstraint(userVerificationService);

        container = createClassValidatorContainer();
        container.register(UsernameUniqueConstraint, usernameUniqueConstraint);
    });

    describe('validate user dto', () => {
        it('should return success validation result', async () => {
            const dto = new UserDto('johnsmith', 'John', 'Smith');
            const result = await ClassValidator.valide(UserDto, dto);
            expect(result.isOk()).toBeTruthy();
        });
    });
});
```

## Keep in touch

Dmitry Kologrivko - dmitrykologrivko@gmail.com

## License

[MIT LICENSE](./LICENSE)
