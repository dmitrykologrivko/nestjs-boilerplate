import { existsSync } from 'fs';
import { Module, DynamicModule } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import {
    ServeStaticModuleOptions,
    ServeStaticModuleAsyncOptions,
    ServeStaticModule,
} from '@nestjs/serve-static';
import { DEVELOPMENT_ENVIRONMENT } from './environment/environment.constants';
import { isProductionEnvironment } from './environment/environment.utils';
import {
    ConfigModule,
    ConfigModuleOptions,
} from './config/config.module';
import { Property } from './config/property.interface';
import { DatabaseModule } from './database/database.module';
import { DatabaseModuleOptions } from './database/database.interfaces';
import {
    MailModule,
    MailModuleOptions,
} from './mail/mail.module';
import { ServerModule } from './server';
import { ManagementModule } from './management/management.module';
import { UtilsModule } from './utils/utils.module';

export interface CoreModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    config?: ConfigModuleOptions;
    database?: DatabaseModule;
    mail?: MailModuleOptions;
    serveStatic?: {
        options?: ServeStaticModuleOptions | ServeStaticModuleOptions[];
        asyncOptions?: ServeStaticModuleAsyncOptions;
    };
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

        return {
            module: CoreModule,
            imports,
        };
    }

    private static connectConfig(imports: any[], options: CoreModuleOptions) {
        if (options.config && options.config instanceof ConfigModule) {
            imports.push(options.config);
            return;
        }

        const envFilePath = `${process.env.NODE_ENV || DEVELOPMENT_ENVIRONMENT}.env`;

        const defaultOptions = {
            isGlobal: true,
            ignoreEnvFile: isProductionEnvironment(),
            envFilePath: existsSync(envFilePath) ? envFilePath : '',
        };

        imports.push(ConfigModule.forRoot({
            ...defaultOptions,
            ...options.config,
        }));
    }

    private static connectDatabase(imports: any[], options: CoreModuleOptions) {
        if (options.database) {
            imports.push(options.database);
            return;
        }

        imports.push(DatabaseModule.withConfig());
    }

    private static connectMail(imports: any[], options: CoreModuleOptions) {
        imports.push(MailModule.forRoot(options.mail));
    }

    private static connectStatic(imports: any[], options: CoreModuleOptions) {
        if (options.serveStatic?.options) {
            if (Array.isArray(options.serveStatic.options)) {
                imports.push(
                    ServeStaticModule.forRoot(...options.serveStatic.options as ServeStaticModuleOptions[]),
                );
            } else {
                imports.push(
                    ServeStaticModule.forRoot(options.serveStatic.options as ServeStaticModuleOptions),
                );
            }
        }

        if (options.serveStatic?.asyncOptions) {
            imports.push(
                ServeStaticModule.forRootAsync(options.serveStatic.asyncOptions as ServeStaticModuleAsyncOptions),
            );
            return;
        }
    }
}
