import { Module, DynamicModule } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { ServerModule } from './server';
import { ManagementModule } from './management/management.module';
import { TemplateModule } from './template/template.module';
import { UtilsModule } from './utils/utils.module';

export interface CoreModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    config?: ConfigModule;
    database?: DatabaseModule;
    mail?: MailModule;
    serveStatic?: ServeStaticModule;
    template?: TemplateModule;
}

@Module({
    imports: [
        ServerModule,
        ManagementModule,
        UtilsModule,
    ],
})
export class CoreModule {

    static forRoot(options: CoreModuleOptions = {}): DynamicModule {
        const imports = options.imports || [];

        this.connectConfig(imports, options);
        this.connectDatabase(imports, options);
        this.connectMail(imports, options);
        this.connectStatic(imports, options);
        this.connectTemplate(imports, options);

        return {
            module: CoreModule,
            imports,
        };
    }

    private static connectConfig(imports: any[], options: CoreModuleOptions) {
        if (options.config) {
            imports.push(options.config);
            return;
        }

        imports.push(ConfigModule.forRoot({}));
    }

    private static connectDatabase(imports: any[], options: CoreModuleOptions) {
        if (options.database) {
            imports.push(options.database);
            return;
        }

        imports.push(DatabaseModule.withConfig());
    }

    private static connectMail(imports: any[], options: CoreModuleOptions) {
        if (options.mail) {
            imports.push(options.mail);
            return;
        }

        imports.push(MailModule.forRoot());
    }

    private static connectStatic(imports: any[], options: CoreModuleOptions) {
        if (options.serveStatic) {
            imports.push(options.serveStatic);
        }
    }

    private static connectTemplate(imports: any[], options: CoreModuleOptions) {
        if (options.template) {
            imports.push(options.template);
            return;
        }

        imports.push(TemplateModule.forRoot());
    }
}
