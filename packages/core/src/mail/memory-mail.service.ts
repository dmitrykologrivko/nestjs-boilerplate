import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { Result, ok } from '../utils/monads';
import { BaseMailService } from './base-mail.service';
import { Mail } from './mail.interfaces';
import { SendMailFailedException } from './send-mail-failed.exception';

@InfrastructureService()
export class MemoryMailService extends BaseMailService {

    outbox: Mail[] = [];

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        this.outbox.push(mail);
        return ok(null);
    }

    async sendMassMail(mails: Mail[]): Promise<Result<void, SendMailFailedException>> {
        this.outbox = this.outbox.concat(mails);
        return ok(null);
    }
}
