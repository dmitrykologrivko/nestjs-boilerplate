# NestJS Boilerplate

NestJS Boilerplate is an open-source high-level framework for [NestJS](https://github.com/nestjs/nest) applications.
It takes it up a notch by making it possible to solve repeatable tasks with less coding. It provides an architectural
model based on Domain Driven Design and contains a variety of extra tools for a quick start developing NestJS
applications. The NestJS Boilerplate aims to follow the principle of pluggable modules to extend functionality and
less repeating common code from project to project. Inspired by Spring Framework, AspNet Boilerplate and Django.

## Install

### First

Install [core package](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/core/docs/getting-started.md),
[testing package](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/testing/docs/README.md#install),
[user package](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/user/README.md#install),
and [auth package](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/auth/README.md#install)

### Then

`$ npm install @nestjs-boilerplate/auth-testing --save`

## Package description

Auth testing is a package that provides additional authentication tools for testing NestJS Boilerplate applications.

## User factory

`UserFactory` class allows creating stub of the User entity.

```typescript
import { UserFactory } from '@nestjs-boilerplate/auth-testing';

UserFactory.makeUser()
    .then(user => console.log(user));
```

## Auth test utils

`AuthTestUtils` class contains a bunch of helpful methods for managing users, JWT tokens. TODO

| Method                     | Description                                                                             |
|----------------------------|-----------------------------------------------------------------------------------------|
| saveUser                   | Saves provided user to the database                                                     |
| makeAndSaveUser            | Makes a stub of the user entity and saves it to the database. Returns the user instance |
| clearAllUsers              | Clear all users from the database                                                       |
| generateJwtToken           | Generates JWT token                                                                     |
| revokeJwtToken             | Adds JWT token to a list of the blocked tokens                                          |
| getJwtAuthHeader           | Returns authorization header value from JWT token                                       |
| generateResetPasswordToken | Generates reset password token for provided user                                        |

```typescript
import { TestingModuleBuilder } from '@nestjs/testing';
import { TestBootstrap } from '@nestjs-boilerplate/testing';
import { User } from '@nestjs-boilerplate/user';
import { UserFactory, AuthTestUtils } from '@nestjs-boilerplate/auth-testing';
import { AppModule } from './src/app.module';

describe('TestClass', () => {
    let app;
    let authTestUtils: AuthTestUtils;
    let user: User;

    beforeAll(async () => {
        app = await new TestBootstrap(AppModule)
            .startApplication();
        authTestUtils = new AuthTestUtils(app);
        user = await authTestUtils.makeAndSaveUser();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await authTestUtils.clearAllUsers();
    });
    
    // Your test cases...
});
```

## Revoked tokens service

`RevokedTokensService` class extends `BaseRevokedTokensService` class and provides a mock implementation 
of the in-memory store of blocked tokens.

```typescript
import { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { TestBootstrap } from '@nestjs-boilerplate/testing';
import { BaseRevokedTokensService, RevokedTokensService } from '@nestjs-boilerplate/auth-testing';
import { AppModule } from './src/app.module';

describe('TestClass', () => {
    let revokedTokesService: BaseRevokedTokensService;
    let app;

    beforeAll(async () => {
        app = await new TestBootstrap(AppModule)
            .startApplication({
                onCreateTestingModule(builder: TestingModuleBuilder) {
                    return builder.overrideProvider(BaseRevokedTokensService)
                        .useValue(new RevokedTokensService());
                },
                onTestingModuleCreated: (testingModule: TestingModule) => {
                    revokedTokesService = app.get<BaseRevokedTokensService, RevokedTokensService>(
                        BaseRevokedTokensService,
                    );
                },
            });
    });

    afterAll(async () => {
        await app.close();
    });
    
    // Your test cases...
});
```

## Keep in touch

Dmitry Kologrivko - dmitrykologrivko@gmail.com

## License

[MIT LICENSE](./LICENSE)
