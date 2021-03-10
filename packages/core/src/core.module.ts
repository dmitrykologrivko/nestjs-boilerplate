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
import { DEFAULT_CONNECTION_NAME } from './database/database.constants';
import { isNotEmpty } from './utils/precondition.utils';
import {
    ConfigModule,
    ConfigModuleOptions,
    ConfigFactory,
} from './config/config.module';
import {
    DatabaseModule,
    DatabaseModuleOptions,
} from './database/database.module';
import { ServerModule } from './server';
import {
    MailModule,
    MailModuleOptions,
} from './mail/mail.module';
import { ManagementModule } from './management/management.module';
import { UtilsModule } from './utils/utils.module';

export interface CoreModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    config?: ConfigModuleOptions | ConfigFactory[];
    database?: {
        useConfigFile?: boolean;
        options?: DatabaseModuleOptions | DatabaseModuleOptions[];
        connections?: string[];
    };
    mail?: MailModuleOptions;
    serveStatic?: ServeStaticModuleOptions | ServeStaticModuleOptions[] | ServeStaticModuleAsyncOptions;
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
        const envFilePath = `${process.env.NODE_ENV || DEVELOPMENT_ENVIRONMENT}.env`;

        const defaultOptions = {
            isGlobal: true,
            ignoreEnvFile: isProductionEnvironment(),
            envFilePath: existsSync(envFilePath) ? envFilePath : '',
        };

        if (!options.config) {
            imports.push(ConfigModule.forRoot(defaultOptions));
            return;
        }

        if (Array.isArray(options.config)) {
            imports.push(ConfigModule.forRoot({
                ...defaultOptions,
                load: options.config,
            }));
            return;
        }

        imports.push(ConfigModule.forRoot(options.config));
    }

    private static connectDatabase(imports: any[], options: CoreModuleOptions) {
        if (options.database?.useConfigFile) {
            imports.push(DatabaseModule.withConfigFile());
            return;
        }

        if (options.database?.options) {
            if (Array.isArray(options.database.options)) {
                for (const currentOptions of options.database.options) {
                    imports.push(DatabaseModule.withOptions(currentOptions));
                }
            } else {
                imports.push(
                    DatabaseModule.withOptions(options.database.options as DatabaseModuleOptions),
                );
            }
            return;
        }

        const connections = isNotEmpty(options.database?.connections)
            ? options.database.connections
            : [DEFAULT_CONNECTION_NAME];

        for (const connection of connections) {
            imports.push(DatabaseModule.withConfig(connection));
        }
    }

    private static connectMail(imports: any[], options: CoreModuleOptions) {
        imports.push(MailModule.forRoot(options.mail));
    }

    private static connectStatic(imports: any[], options: CoreModuleOptions) {
        if (!options.serveStatic) {
            return;
        }

        if (options.serveStatic.hasOwnProperty('imports')) {
            imports.push(
                ServeStaticModule.forRootAsync(options.serveStatic as ServeStaticModuleAsyncOptions),
            );
            return;
        }

        if (Array.isArray(options.serveStatic)) {
            imports.push(ServeStaticModule.forRoot(...options.serveStatic));
        } else {
            imports.push(
                ServeStaticModule.forRoot(options.serveStatic as ServeStaticModuleOptions),
            );
        }
    }
}
