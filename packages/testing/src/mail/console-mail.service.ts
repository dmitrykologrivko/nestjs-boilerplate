import { Logger } from '@nestjs/common';
import {
    InfrastructureService,
    PropertyConfigService,
    BaseMailService,
    Mail,
} from '@nestjs-boilerplate/core';

@InfrastructureService()
export class ConsoleMailService extends BaseMailService {

    constructor(
        config: PropertyConfigService,
    ) {
        super(config);
    }

    protected async onOpenConnection(mass: boolean): Promise<void> {
        return Promise.resolve();
    }

    protected async onCloseConnection(connection: any, mass: boolean): Promise<void> {
        return Promise.resolve();
    }

    protected async onSendMail(mail: Mail, connection: any): Promise<void> {
        Logger.debug(mail);
        return Promise.resolve();
    }
}
