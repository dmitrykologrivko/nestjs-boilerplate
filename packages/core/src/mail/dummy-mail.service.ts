import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { Result, ok } from '../utils/monads';
import { BaseMailService } from './base-mail.service';
import { Mail } from './mail.interfaces';
import { SendMailFailedException } from './send-mail-failed.exception';

@InfrastructureService()
export class DummyMailService extends BaseMailService {

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        return ok(null);
    }

    async sendMassMail(mails: Mail[]): Promise<Result<void, SendMailFailedException>> {
        return ok(null);
    }
}
