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
import {Injectable} from '@nestjs/common';
import {BaseEmailService} from 'packages/core/dist/index';

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

**Mail object may contains the following options:**\
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

**Attachment object may contains the following options:**\

content?: string | Buffer | Readable;
path?: string | Url;
filename?: string | false;
contentType?: string;
encoding?: string;
headers?: { key: string, value: string }[];

`content` string, buffer, or a stream contents for the attachment.\
`path` path to the file instead of using content option.\
`filename` filename for attachment file.\
`contentType` content type for the attachment.\
`encoding` this option allows encoding the content to a buffer using the provided encoding type only if the content is 
a string. Example: base64, hex, binary etc.\
`headers` an array of additional header fields for attachment. Same usage as with message headers.

```typescript
const mail = {
    from: 'noreply@example.com',
    to: ['test@example.com'],
    subject: 'Example of attachments',
    text: 'Example of attachments',
    attachments: [
        {
            filename: 'example.txt',
            content: 'example!',
            contentType: 'text/plain',
        },
        {
            filename: 'example1.txt',
            content: new Buffer('example!', 'utf-8'),
            contentType: 'text/plain',
        },
        {
            filename: 'example2.txt',
            path: '/var/mail/example.txt',
            contentType: 'text/plain',
        },
        {
            filename: 'example3.txt',
            content: fs.createReadStream('/var/mail/example.txt'),
            contentType: 'text/plain',
        },
        {
            filename: 'example4.txt',
            content: 'ZXhhbXBsZQ==',
            encoding: 'base64',
        },
    ],
}
```

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

Create host module for custom smtp service and make module global scoped.

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
import { CoreModule } from '@nestjs-boilerplate/core';
import { AppController } from './app.controller';
import { CustomSmtpMailModule } from './custom-smtp-mail.service';
import { CustomSmtpMailService } from './custom-smtp-mail.service';

@Module({
    imports: [
        CoreModule.forRoot({
            mail: {
                service: CustomSmtpMailService,
            },
        }),
        CustomSmtpMailModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
```