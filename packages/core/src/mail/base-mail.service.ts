import { PropertyConfigService } from '../config/property-config.service';
import { Mail, MailOptions } from './mail.interfaces';
import { MAIL_PROPERTY } from './mail.properties';
import { SendMailFailedException } from './send-mail-failed.exception';

export abstract class BaseMailService<T extends Mail = Mail, V = any> {

    protected readonly options: MailOptions;

    constructor(
        protected readonly config: PropertyConfigService,
    ) {
        this.options = this.config.get(MAIL_PROPERTY);
    }

    protected abstract onOpenConnection(mass: boolean): Promise<V>;

    protected abstract onCloseConnection(connection: V, mass: boolean);

    protected abstract onSendMail(mail: T, connection: V): Promise<void>;

    /**
     * Send mail function
     * @param mail Mail object or array of Mail objects
     * @throws SendMailFailedException
     */
    async sendMail(mail: T | T[]): Promise<void> {
        try {
            const mass = Array.isArray(mail);

            const connection = await this.onOpenConnection(mass);

            if (mass) {
                for (const item of mail as T[]) {
                    await this.onSendMail(this.extendMail(item), connection);
                }
            } else {
                await this.onSendMail(this.extendMail(mail as T), connection);
            }

            await this.onCloseConnection(connection, mass);
            return null;
        } catch (e) {
            throw new SendMailFailedException(e.stackTrace);
        }
    }

    protected extendMail(mail: T) {
        return {
            ...mail,
            from: mail.from || this.options.defaultFrom,
        };
    }
}
