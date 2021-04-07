import { Global, Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { Constructor } from '../utils/type.utils';
import { BaseMailService } from './base-mail.service';
import { NodemailerService } from './nodemailer.service';
import { ConsoleMailService } from './console-mail.service';
import { DummyMailService } from './dummy-mail.service';
import mailConfig from './mail.config';

export interface MailModuleOptions<T extends BaseMailService = NodemailerService> {
    service?: Constructor<T>;
}

@Global()
@Module({
    imports: [ConfigModule.forFeature(mailConfig)],
    providers: [
        NodemailerService,
        ConsoleMailService,
        DummyMailService,
    ],
    exports: [
        NodemailerService,
        ConsoleMailService,
        DummyMailService,
    ],
})
export class MailModule {

    static forRoot(options: MailModuleOptions = {}): DynamicModule {
        const mailServiceProvider = {
            provide: BaseMailService,
            useClass: options.service || NodemailerService,
        };
        return {
            module: MailModule,
            global: true,
            providers: [mailServiceProvider],
            exports: [mailServiceProvider.provide],
        };
    }
}
