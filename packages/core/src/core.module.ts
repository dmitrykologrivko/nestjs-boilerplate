import { Module, DynamicModule } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { DEVELOPMENT_ENVIRONMENT } from './environment/environment.constants';
import { isProductionEnvironment } from './environment/environment.utils';
import {
    ConfigModule,
    ConfigModuleOptions,
    ConfigFactory,
} from './config/config.module';
import {
    DatabaseModule,
    DatabaseModuleOptions,
    DEFAULT_CONNECTION_NAME,
} from './database';
import { ServerModule } from './server';
import { ManagementModule } from './management';
import { UtilsModule } from './utils';
import { isNotEmpty } from './utils/precondition.utils';

export interface CoreModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    config?: ConfigModuleOptions | ConfigFactory[];
    database?: {
        useConfigFile?: boolean;
        options?: DatabaseModuleOptions | DatabaseModuleOptions[];
        connections?: string[];
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

        return {
            module: CoreModule,
            imports,
        };
    }

    private static connectConfig(imports: any[], options: CoreModuleOptions) {
        const defaultOptions = {
            isGlobal: true,
            ignoreEnvFile: isProductionEnvironment(),
            envFilePath: `${process.env.NODE_ENV || DEVELOPMENT_ENVIRONMENT}.env`,
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
                imports.push(DatabaseModule.withOptions(options.database.options as DatabaseModuleOptions));
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
}
