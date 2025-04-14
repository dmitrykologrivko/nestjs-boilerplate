import { TLSSocketOptions } from 'tls';
import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { PropertyConfigService } from '../config/property-config.service';
import { BaseMailService } from './base-mail.service';
import { Mail } from './mail.interfaces';

@InfrastructureService()
export class SmtpMailService extends BaseMailService<Mail, Transporter> {

    constructor(
        config: PropertyConfigService,
    ) {
        super(config);
    }

    private tlsOptions: TLSSocketOptions;

    protected createTransport(mass: boolean): Transporter {
        return createTransport({
            pool: mass,
            host: this.options.smtp?.host,
            port: this.options.smtp?.port,
            secure: this.options.smtp?.useTls,
            auth: {
                user: this.options.smtp?.auth?.user,
                pass: this.options.smtp?.auth?.password,
            },
            connectionTimeout: this.options.smtp?.timeout,
            tls: this.tlsOptions,
        } as any);
    }

    protected async onOpenConnection(mass: boolean): Promise<Transporter> {
        return this.createTransport(mass);
    }

    protected async onCloseConnection(connection: Transporter, mass: boolean) {
        connection.close();
    }

    protected async onSendMail(mail: Mail, connection: Transporter) {
        await connection.sendMail(this.mapToNodemailerMail(mail));
    }

    useTLSSocketOptions(options: TLSSocketOptions) {
        this.tlsOptions = options;
    }

    private mapToNodemailerMail(mail: Mail): SendMailOptions {
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
