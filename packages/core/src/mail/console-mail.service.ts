import { Logger } from '@nestjs/common';
import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { Result, ok } from '../utils/monads';
import { BaseMailService } from './base-mail.service';
import { Mail } from './mail.interfaces';
import { SendMailFailedException } from './send-mail-failed.exception';

@InfrastructureService()
export class ConsoleMailService extends BaseMailService {

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        Logger.debug(mail);
        return ok(null);
    }

    async sendMassMail(mails: Mail[]): Promise<Result<void, SendMailFailedException>> {
        Logger.debug(mails);
        return ok(null);
    }
}
