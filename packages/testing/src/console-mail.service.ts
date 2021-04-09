import { Logger } from '@nestjs/common';
import {
    InfrastructureService,
    Result,
    ok,
    BaseMailService,
    Mail,
    SendMailFailedException,
} from '@nestjs-boilerplate/core';

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
