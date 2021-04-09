import {
    InfrastructureService,
    Result,
    ok,
    BaseMailService,
    Mail,
    SendMailFailedException,
} from '@nestjs-boilerplate/core';

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
