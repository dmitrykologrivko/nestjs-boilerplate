import { Module, DynamicModule } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ConfigModule, ConfigModuleOptions } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { DomainModule } from './domain/domin.module';
import { MailModule, MailModuleOptions } from './mail/mail.module';
import { ServerModule } from './server';
import { ManagementModule } from './management/management.module';
import { TemplateModule, TemplateModuleOptions } from './template/template.module';
import { UtilsModule } from './utils/utils.module';
import { Constructor } from './utils/type.utils';

export interface CoreModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    config?: ConfigModuleOptions;
    mail?: MailModuleOptions;
    template?: TemplateModuleOptions;
}

@Module({
    imports: [
        DomainModule,
        ServerModule,
        ManagementModule,
        UtilsModule,
    ],
})
export class CoreModule {

    static forRoot(options: CoreModuleOptions = {}): DynamicModule {
        const imports = options.imports || [];

        this.connectConfig(imports, options);
        this.connectMail(imports, options);
        this.connectTemplate(imports, options);
        this.connectDatabase(imports);

        return {
            module: CoreModule,
            imports,
        };
    }

    private static connectConfig(imports: any[], options: CoreModuleOptions) {
        if (options.config) {
            imports.push(ConfigModule.forRoot(options.config));
            return;
        }

        imports.push(ConfigModule.forRoot({}));
    }

    private static connectMail(imports: any[], options: CoreModuleOptions) {
        if (options.mail) {
            imports.push(MailModule.forRoot(options.mail));
            return;
        }

        imports.push(MailModule.forRoot());
    }

    private static connectTemplate(imports: any[], options: CoreModuleOptions) {
        if (options.template) {
            imports.push(TemplateModule.forRoot(options.template));
            return;
        }

        imports.push(TemplateModule.forRoot());
    }

    private static connectDatabase(imports: any[]) {
        if (!this.containsModule(imports, DatabaseModule)) {
            imports.push(DatabaseModule.withConfig());
        }
    }

    private static containsModule(imports: any[], module: Constructor) {
        return imports.filter(value => value?.module === module).length !== 0;
    }
}
