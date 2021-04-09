import { Result } from '../utils/monads';
import { Mail } from './mail.interfaces';
import { SendMailFailedException } from './send-mail-failed.exception';

export abstract class BaseMailService {

    abstract async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>>;

    abstract async sendMassMail(mails: Mail[]): Promise<Result<void, SendMailFailedException>>;

}
