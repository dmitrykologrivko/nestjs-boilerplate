import {
    InfrastructureService,
    Result,
    ok,
    BaseMailService,
    Mail,
    SendMailFailedException,
} from '@nestjs-boilerplate/core';

@InfrastructureService()
export class NullMailService extends BaseMailService {

    async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>> {
        return ok(null);
    }

    async sendMassMail(mails: Mail[]): Promise<Result<void, SendMailFailedException>> {
        return ok(null);
    }
}
