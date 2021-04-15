import {
    Global,
    Module,
    DynamicModule,
    Type,
} from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { BaseMailService } from './base-mail.service';
import { SmtpMailService } from './smtp-mail.service';
import mailConfig from './mail.config';

export interface MailModuleOptions<T extends BaseMailService = SmtpMailService> {
    service?: Type<T>;
}

@Global()
@Module({
    imports: [ConfigModule.forFeature(mailConfig)],
    providers: [SmtpMailService],
    exports: [SmtpMailService],
})
export class MailModule {

    static forRoot<T extends BaseMailService = SmtpMailService>(
        options: MailModuleOptions<T> = {},
    ): DynamicModule {
        const mailServiceProvider = {
            provide: BaseMailService,
            useExisting: options.service || SmtpMailService,
        };
        return {
            module: MailModule,
            global: true,
            providers: [mailServiceProvider],
            exports: [mailServiceProvider.provide],
        };
    }
}
