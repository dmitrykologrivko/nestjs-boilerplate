import {
    InfrastructureService,
    PropertyConfigService,
    BaseMailService,
    Mail,
} from '@nestjs-boilerplate/core';

@InfrastructureService()
export class MemoryMailService extends BaseMailService {

    constructor(
        config: PropertyConfigService,
    ) {
        super(config);
    }

    outbox: Mail[] = [];

    protected async onOpenConnection(mass: boolean): Promise<void> {
        return Promise.resolve();
    }

    protected async onCloseConnection(connection: any, mass: boolean): Promise<void> {
        return Promise.resolve();
    }

    protected async onSendMail(mail: Mail, connection: any): Promise<void> {
        this.outbox.push(mail);
        return Promise.resolve();
    }
}
