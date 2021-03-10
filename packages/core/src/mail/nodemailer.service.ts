import { createTransport, Transporter } from 'nodemailer';
import { PropertyConfigService } from '../config/property-config.service';
import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { Result, ok, err } from '../utils/monads';
import { MAIL_PROPERTY } from './mail.properties';
import { Mail, BaseMailService } from './base-mail.service';
import { SendMailFailedException } from './send-mail-failed.exception';

@InfrastructureService()
export class NodemailerService extends BaseMailService {
    readonly transporter: Transporter;

    constructor(
        private readonly config: PropertyConfigService,
    ) {
        super();
        const options = this.config.get(MAIL_PROPERTY);
        this.transporter = createTransport({
            host: options.host,
            port: options.port,
            secure: options.secure,
            auth: {
                user: options.auth?.user,
                pass: options.auth?.password,
            },
        });
    }

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        try {
            await this.transporter.sendMail({
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
            });

            return ok(null);
        } catch (e) {
            return err(new SendMailFailedException(e.stackTrace));
        }
    }

}
