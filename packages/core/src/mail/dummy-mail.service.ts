import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { Result, ok } from '../utils/monads';
import { Mail, BaseMailService } from './base-mail.service';
import { SendMailFailedException } from './send-mail-failed.exception';

@InfrastructureService()
export class DummyMailService extends BaseMailService {

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        return ok(null);
    }

}
