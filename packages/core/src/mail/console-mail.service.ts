import { Logger } from '@nestjs/common';
import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { Result, ok } from '../utils/monads';
import { Mail, BaseMailService } from './base-mail.service';
import { SendMailFailedException } from './send-mail-failed.exception';

@InfrastructureService()
export class ConsoleMailService extends BaseMailService {

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        Logger.debug(mail);
        return ok(null);
    }

}
