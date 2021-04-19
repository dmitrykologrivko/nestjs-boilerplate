# Configuration

Nest lets you define your application configuration so that you can work with the same codebase but in different 
environments. Detailed description of the application configuration you can find in the 
[official documentation](https://docs.nestjs.com/techniques/configuration). Basically, we need to use `@nestjs/config` 
package to have a possibility to configure the application but NestJS Boilerplate has an additional extension of this 
library and offers to use configuration segregation by global and module levels.

## Global configuration

In fact, global level configuration is application configuration. You can define here configuration that can be used 
across the application.

**Build-in global configuration:**\
`debug` is a flag that allows you to build some logic that helpful for debugging, for example, display detailed 
stack trace. **Never deploy an application into production with debug flag turned on.**\
`secretKey` is a secret key for a particular NestJS Boilerplate application. Can be used to provide cryptographic 
signing, and should be set as a unique value.

You can add new configuration values in the global config or override the existing global configuration, including 
a module configuration. Create `app.config.ts` file in the root of the `src` folder of your application source code and
put some configuration values.

```typescript
export default () => ({
    secretKey: 'some-secret-key-value',
});
```

Load your app config by using `load` option of config module options. 

```typescript
import { Module } from '@nestjs/common';
import { CoreModule, ConfigModule } from '@nestjs-boilerplate/core';
import { AppController } from './app.controller';
import { CustomSmtpMailModule } from './custom-smtp-mail.service';
import { CustomSmtpMailService } from './custom-smtp-mail.service';
import appConfig from './app.config';

@Module({
    imports: [
        CoreModule.forRoot({
            config: ConfigModule.forRoot({
                load: [appConfig],
            }),
        }),
        CustomSmtpMailModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
```

## Module configuration

Module configuration defines a configuration that applies to the current module. We can imagine that we develop a mail 
module, let's create`mail.config.ts` file under your mail module.

```typescript
export default () => ({
    mail: {
        host: 'smtp.example.com',
        username: 'test@example.com',
        password: 'test-password',
    }
});
```

Then register mail config in the mail module by using `ConfigModule.forFeature` method.

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs-boilerplate/core';
import mailConfig from './mail.config';

@Module({
    imports: [
        ConfigModule.forFeature(mailConfig),
    ],
})
export class MailModule {}
```

## Inject configuration into services

To access configuration values from your services you need to inject `ConfigService` into your service.

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailTransport } from './mail.transport';

@Injectable()
export class MailService {
    private readonly mailTransport: MailTransport;
    
    constructor(
        private readonly config: ConfigService,
    ) {
        this.mailTransport = new MailTransport(
            this.config.get<string>('mail.host'),
            this.config.get<string>('mail.username'),
            this.config.get<string>('mail.password'),
        );
    }
    
    async sendEmail(email: string, text: string) {
        await this.mailTransport.send(email, text);
    }
}
```

You can also get the whole configuration object. Firstly, we need to create a configuration options interface.

```typescript
export interface MailOptions {
    host: string;
    username: string;
    password: string;
}
```

You can now get a typed configuration object.

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailTransport } from './mail.transport';
import { MailOptions } from './mail.interfaces';

@Injectable()
export class MailService {
    private readonly mailTransport: MailTransport;
    
    constructor(
        private readonly config: ConfigService,
    ) {
        const options: MailOptions = this.config.get<MailOptions>('mail');
        this.mailTransport = new MailTransport(
            options.host,
            options.username,
            options.password,
        );
    }
    
    async sendEmail(email: string, text: string) {
        await this.mailTransport.send(email, text);
    }
}
```

**Note:** `ConfigService` is a class from `@nestjs/config` package, see
[an official documentation](https://docs.nestjs.com/techniques/configuration#using-the-configservice).

At the same time NestJS Boilerplate has a property adapter class `PropertyConfigService`. This class allows getting 
configuration values by predefined path, type and default values. This can save you from duplicating config paths and 
types if you need to use the configuration object in different places in the module.

You need to define property for a configuration options interface.

```typescript
import { Property } from '@nestjs-boilerplate/core';
import { MailOptions } from './mail.interfaces';

export const MAIL_PROPERTY: Property<MailOptions> = { path: 'mail', defaultValue: {} };
```

Then inject `PropertyConfigService` into the service.

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs-boilerplate/core';
import { MailTransport } from './mail.transport';
import { MailOptions } from './mail.interfaces';
import { MAIL_PROPERTY } from './mail.properties';

@Injectable()
export class MailService {
    private readonly mailTransport: MailTransport;
    
    constructor(
        private readonly config: PropertyConfigService,
    ) {
        const options: MailOptions = this.config.get(MAIL_PROPERTY);
        this.mailTransport = new MailTransport(
            options.host,
            options.username,
            options.password,
        );
    }
    
    async sendEmail(email: string, text: string) {
        await this.mailTransport.send(email, text);
    }
}
```

## Configuration module options

`ConfigModule` from `@nestjs-boilerplate/core` package has the same options and functionality as `ConfigModule` 
from `@nestjs/config` package. Actually, this is an addition to the original module. Feel free to use all functionality 
of `@nestjs/config` package.