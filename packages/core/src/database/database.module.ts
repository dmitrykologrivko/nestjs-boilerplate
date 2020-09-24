import { Module, DynamicModule } from '@nestjs/common';
import {
    TypeOrmModule,
    TypeOrmModuleOptions,
    TypeOrmModuleAsyncOptions,
} from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { PropertyConfigService } from '../config/property-config.service';
import { DEFAULT_CONNECTION_NAME } from './database.constants';
import { DATABASES_PROPERTY } from './database.properties';
import { MigrationsCommand } from './migrations.command';
import { EntityMetadataStorage } from './entity-metadata-storage.service';
import { EntitySwappableService } from './entity-swappable.service';
import { EntityOptions, DatabaseConnection } from './database.interfaces';
import databaseConfig from './database.config';

export type DatabaseModuleOptions = TypeOrmModuleOptions;
export type DatabaseModuleAsyncOptions = TypeOrmModuleAsyncOptions;

@Module({
    imports: [ConfigModule.forFeature(databaseConfig)],
    providers: [
        PropertyConfigService,
        EntityMetadataStorage,
        MigrationsCommand,
    ],
})
export class DatabaseModule {

    static withOptions(options: DatabaseModuleOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRoot(options)],
            exports: [TypeOrmModule],
        };
    }

    static withOptionsAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRootAsync(options)],
            exports: [TypeOrmModule],
        };
    }

    static withConfigFile(): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRoot()],
            exports: [TypeOrmModule],
        };
    }

    static withConfig(connection: string = DEFAULT_CONNECTION_NAME): DynamicModule {
        const asyncOptions: TypeOrmModuleAsyncOptions = {
            imports: [PropertyConfigService],
            useFactory: (config: PropertyConfigService) => {
                const databaseOptions = config.get(DATABASES_PROPERTY);

                for (const options of databaseOptions) {
                    if (!options.name && connection === DEFAULT_CONNECTION_NAME) {
                        return this.extendDatabaseOptions(connection, options);
                    }

                    if (options.name === connection) {
                        return this.extendDatabaseOptions(connection, options);
                    }
                }

                throw new Error(`${connection} database config is not defined`);
            },
            inject: [PropertyConfigService],
        };

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forRootAsync(asyncOptions)],
            exports: [TypeOrmModule],
        };
    }

    static withEntities(
        entities: Function[] = [],
        options: EntityOptions = {},
        connection: DatabaseConnection = DEFAULT_CONNECTION_NAME,
    ): DynamicModule {
        entities = entities.map(entity => EntitySwappableService.findSwappable(entity) || entity);
        options.entities = entities;

        this.addEntityOptions(options);

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forFeature(entities, options?.connection || connection)],
            exports: [TypeOrmModule],
        };
    }

    static withMigrations(
        migrations: Function[] = [],
        connection: DatabaseConnection = DEFAULT_CONNECTION_NAME,
    ): DynamicModule {
        this.addEntityOptions({ migrations, connection });
        return { module: DatabaseModule };
    }

    static withEntityOptions(options: EntityOptions): DynamicModule {
        this.addEntityOptions(options);
        return { module: DatabaseModule };
    }

    static swapEntities<E extends Function, S extends E>(...entities: Array<[E, S]>) {
        EntitySwappableService.swapEntities(entities);
    }

    private static extendDatabaseOptions(connection: string, databaseOptions: TypeOrmModuleOptions) {
        const entityOptions = EntityMetadataStorage.getEntityOptionsByConnection(connection);

        if (!entityOptions) {
            return databaseOptions;
        }

        let entities = databaseOptions.entities || [];
        let migrations = databaseOptions.migrations || [];

        for (const options of entityOptions) {
            if (options.entities) {
                const entitiesNames = entities
                    .filter(entity => typeof entity === 'function')
                    .map(entity => (entity as Function).name);

                entities = entities.concat(
                    options.entities.filter(entity => !entitiesNames.includes(entity.name)),
                );
            }

            if (options.migrations) {
                const migrationsNames = entities
                    .filter(migration => typeof migration === 'function')
                    .map(migration => (migration as Function).name);

                migrations = migrations.concat(
                    options.migrations.filter(migration => !migrationsNames.includes(migration.name)),
                );
            }
        }

        return { ...databaseOptions, entities, migrations };
    }

    private static addEntityOptions(options: EntityOptions) {
        if (!options.connection) {
            options.connection = DEFAULT_CONNECTION_NAME;
        }

        EntityMetadataStorage.addEntityOptions(options);
    }
}
