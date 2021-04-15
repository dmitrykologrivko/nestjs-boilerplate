# Mail

Sending emails is a very common task for most applications. Since Nest does not support sending emails out-of-the-box
we need a 3rd-party library for it. NestJS Boilerplate contains a light wrapper over Nodemailer library.
At the same time, NestJS Boilerplate provides an abstract interface for sending emails, so you can implement
your own service of sending emails.

[Nodemailer](https://nodemailer.com/about/) is a module for Node.js applications to allow easy as cake email sending.
The project got started back in 2010 when there was no sane option to send email messages, today it is the solution
most Node.js users turn to by default.

## Sending mail

`BaseMailService` is a service class to send emails without knowing the details. To start sending mail you need
to inject `BaseMailService` service to your application service and use `sendMail` method. You can provide one 
instance of `Mail` object or array with it. If you provide an array of the `Mail` objects then this method uses 
single connection for sending all provided mail else for each `Mail` object will be used separated connection.

```typescript
import { Injectable } from '@nestjs/common';
import { BaseEmailService } from '@nestjs-boilerplate/core';

@Injectable()
class WelcomeService {
    constructor(
        protected readonly emailService: BaseMailService,
    ) {}
    
    async sendWelcomeEmail(username: string, email: string) {
        await this.emailService.sendEmail({
            from: 'noreply@example.com',
            to: [email],
            subject: 'Welcome Email!',
            text: `Welcome ${username}!`,
        });
    }
}
```

**Mail object may contains the following:**\
`from` the email address of the sender. If it is not provided then will be used `defaultFrom` email address from 
the email config.\
`to` array of recipients email addresses.\
`cc` array of recipients email addresses.\
`bcc` array of recipients email addresses.\
`replyTo` the email address that will appear on the Reply-To: field.\
`subject` the subject of the email.\
`text` the plaintext version of the message.\
`html` the HTML version of the message.\
`attachments` an array of attachment objects.\
`headers` an array of additional header fields `[{key: “X-Key-Name”, value: “val1”},
{key: “X-Key-Name”, value: “val2”}])`

Email addresses can be plain ‘sender@example.com’ or formatted '“Sender Name” sender@example.com'.

**Attachments:**\
hf

## Configuration

The mail module has its own configuration options. It is basic mail settings and SMTP connection options such as host, 
port, and auth details. You can define `mail` object in the application config or set corresponding environment
variables.

```typescript
export default () => ({
    mail: {
        defaultFrom: 'noreply@example.com',
        smtp: {
            host: 'smtp.example.email',
            port: 587,
            useTls: false,
            auth: {
                user: 'may99@test.email',
                password: 'bZBCgfNdhve9A56QCv',
            },
            timeout: 30000, 
        },
    }
});
```

`defaultFrom` is default email address of the sender. Alternatively you can define `MAIL_DEFAULT_FROM`
environment variable.\
`smtp.host` is the hostname or IP address to connect to. Alternatively you can define `MAIL_SMTP_HOST` 
environment variable.\
`smtp.port` is the port to connect to. Alternatively you can define `MAIL_SMTP_PORT`
environment variable.\
`smtp.useTls` should use TLS when connecting to server. Alternatively you can define `MAIL_SMTP_USE_TLS` 
environment variable.\
`smtp.auth.user` defines authentication data. Alternatively you can define `MAIL_SMTP_AUTH_USER` 
environment variable.\
`smtp.auth.password` defines authentication data. Alternatively you can define `MAIL_SMTP_AUTH_PASSWORD` 
environment variable.\
`smtp.timeout` is connection timeout, how many milliseconds to wait for the connection to establish. Alternatively
you can define `MAIL_SMTP_TIMEOUT` environment variable.


## SMTP transport

By default, emails will be sent using `SmtpMailService` which extends `BaseMailService` service class.
`SmtpMailService` implements sending emails through SMTP transport by using Nodemailer library. Using this service 
will be enough for most cases.

To get information on how to configure SMTP connection, see Configuration section above. If you want to set up 
TLS socket options then you can do this on the module init event.

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule, SmtpMailService } from '@nestjs-boilerplate/core';
import { AppController } from './app.controller';

@Module({
    imports: [CoreModule.forRoot()],
    controllers: [AppController],
})
export class AppModule implements OnModuleInit {
   constructor(
     protected mailService: SmtpMailService,
   ) {}

   onModuleInit(): any {
      this.mailService.useTLSSocketOptions({
          rejectUnauthorized: true,
      });
   }
}
```

## Other transports

In addition to the default SMTP transport, you can implement another kind of transports. Mail module exposes Nodemailer, 
so you can re-use it to create other mail services based on that library.

Let's create a custom smtp service for using some abstract smtp mail library. First, you need to create a connection
options interface.

```typescript
export interface CustomSmtpMailOptions {
    host: string;
    port: string;
    username: string;
    password: string;
    timeout: number;
}
```

Define a config property.

```typescript
import { CustomSmtpMailOptions } from './custom-smtp-mail-options.interface';
import { Property } from '@nestjs-boilerplate/core';

export const CUSTOM_SMTP_MAIL_PROPERTY: Property<CustomSmtpMailOptions> = {
    path: 'mail.customSmtp',
};
```

We can define a custom mail object.\
**Note:** additional properties on the mail object extension must be optional because external packages rely on 
the base interface.

```typescript
import { Mail } from '@nestjs-boilerplate/core';

export interface CustomMail extends Mail {
    encoding?: string;
}
```

Create a custom smtp mail service.

```typescript
import {
    PropertyConfigService,
    InfrastructureService,
    BaseMailService,
} from '@nestjs-boilerplate/core';
import { SmtpTransport, SmtpConnection } from './smtp-mail';
import { CustomMail } from './custom-mail.interface';
import { CustomSmtpMailOptions } from './custom-smtp-mail-options.interface';
import { CUSTOM_SMTP_MAIL_PROPERTY } from './custom-smtp-mail.properties';

@InfrastructureService()
export class CustomSmtpMailService extends BaseMailService<CustomMail, SmtpConnection> {
    
    private readonly customSmtpMailOptions: CustomSmtpMailOptions;

    constructor(
        config: PropertyConfigService,
    ) {
        super(config);
        this.customSmtpMailOptions = this.config.get(CUSTOM_SMTP_MAIL_PROPERTY);
    }

    protected async onOpenConnection(mass: boolean): Promise<SmtpConnection> {
        const transport = new SmtpTransport(this.customSmtpMailOptions);
        return await transport.connect();
    }

    protected async onCloseConnection(connection: SmtpConnection, mass: boolean) {
        await connection.close();
    }

    protected async onSendMail(mail: CustomMail, connection: SmtpConnection) {
        await connection.sendMail(mail);
    }
}
```

Create a module and register custom smtp service in the global scope.

```typescript
import { Module, Global } from '@nestjs/common';
import { CustomSmtpMailService } from './custom-smtp-mail.service';

@Global()
@Module({
    providers: [CustomSmtpMailService],
    exports: [CustomSmtpMailService],
})
export class CustomSmtpMailModule {}
```

Finally, provide a custom smtp mail service constructor function to the mail module options to replace the current 
mail service.

```typescript
import { Module } from '@nestjs/common';
import { CoreModule, MailModule } from '@nestjs-boilerplate/core';
import { AppController } from './app.controller';
import { CustomSmtpMailModule } from './custom-smtp-mail.service';
import { CustomSmtpMailService } from './custom-smtp-mail.service';

@Module({
    imports: [
        CoreModule.forRoot({
            mail: MailModule.forRoot<CustomSmtpMailService>({
                service: CustomSmtpMailService,
            })
        }),
        CustomSmtpMailModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
```