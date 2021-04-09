import { TLSSocketOptions } from 'tls';
import { createTransport } from 'nodemailer';
import { PropertyConfigService } from '../config/property-config.service';
import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { Result, ok, err } from '../utils/monads';
import { MAIL_PROPERTY } from './mail.properties';
import { BaseMailService } from './base-mail.service';
import { MailOptions, Mail } from './mail.interfaces';
import { SendMailFailedException } from './send-mail-failed.exception';

@InfrastructureService()
export class SmtpMailService extends BaseMailService {

    private readonly options: MailOptions;
    private tlsOptions: TLSSocketOptions;

    constructor(
        private readonly config: PropertyConfigService,
    ) {
        super();
        this.options = this.config.get(MAIL_PROPERTY);
    }

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        try {
            await createTransport(this.getConnectionOptions())
                .sendMail(this.mapToTransportMail(mail));
            return ok(null);
        } catch (e) {
            return err(new SendMailFailedException(e.stackTrace));
        }
    }

    async sendMassMail(mails: Mail[]): Promise<Result<void, SendMailFailedException>> {
        try {
            const transporter = createTransport({
                pool: true,
                ...this.getConnectionOptions(),
            });

            for (const mail of mails) {
                await transporter.sendMail(this.mapToTransportMail(mail));
            }

            transporter.close();
            return ok(null);
        } catch (e) {
            return err(new SendMailFailedException(e.stackTrace));
        }
    }

    useTLSSocketOptions(options: TLSSocketOptions) {
        this.tlsOptions = options;
    }

    private getConnectionOptions() {
        return {
            host: this.options.host,
            port: this.options.port,
            secure: this.options.useTls,
            auth: {
                user: this.options.auth?.user,
                pass: this.options.auth?.password,
            },
            connectionTimeout: this.options.timeout,
            tls: this.tlsOptions,
        };
    }

    private mapToTransportMail(mail: Mail) {
        return {
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
            headers: mail.headers,
            attachments: mail.attachments,
            from: mail.from,
            to: mail.to,
            cc: mail.cc,
            bcc: mail.bcc,
            replyTo: mail.replyTo,
        };
    }
}
