import { getConnectionOptions } from 'typeorm';
import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { Property } from '../config/property.interface';
import { PropertyConfigService } from '../config/property-config.service';
import { DEFAULT_CONNECTION_NAME } from './database.constants';
import { DEFAULT_DATABASE_PROPERTY } from './database.properties';
import { MigrationsCommand } from './migrations.command';
import { MetadataStorageService } from './metadata-storage.service';
import { EntitySwappableService } from './entity-swappable.service';
import {
    Metadata,
    DatabaseModuleOptions,
} from './database.interfaces';
import databaseConfig from './database.config';

@Module({
    imports: [ConfigModule.forFeature(databaseConfig)],
    providers: [
        MetadataStorageService,
        MigrationsCommand,
    ],
})
export class DatabaseModule {

    static withOptions(
        options: DatabaseModuleOptions[],
        ormconfig: boolean = false,
    ): DynamicModule {
        let imports;

        if (ormconfig) {
            imports = options.map(value => (
                TypeOrmModule.forRootAsync({
                    useFactory: async () => {
                        const name = value.name || DEFAULT_CONNECTION_NAME;
                        return this.extendDatabaseOptions(
                            name,
                            Object.assign(await getConnectionOptions(name), options),
                        );
                    }
                })
            ));
        } else {
            imports = options.map(value => (
                TypeOrmModule.forRoot(
                    this.extendDatabaseOptions(
                        value.name || DEFAULT_CONNECTION_NAME,
                        value,
                    ),
                )
            ));
        }

        return {
            module: DatabaseModule,
            imports,
            exports: [TypeOrmModule],
        };
    }

    static withConfig(
        properties: Property<DatabaseModuleOptions>[] = [ DEFAULT_DATABASE_PROPERTY ],
    ): DynamicModule {
        return {
            module: DatabaseModule,
            imports: properties.map(value => (
                TypeOrmModule.forRootAsync({
                    imports: [PropertyConfigService],
                    useFactory: (config: PropertyConfigService) => {
                        const options = config.get(value);
                        return this.extendDatabaseOptions(
                            options.name || DEFAULT_CONNECTION_NAME,
                            options,
                        );
                    },
                    inject: [PropertyConfigService],
                })
            )),
            exports: [TypeOrmModule],
        };
    }

    static withEntities(
        entities: Function[] = [],
        options: Pick<Metadata, 'cli' | 'connection'> = {},
    ): DynamicModule {
        entities = entities.map(entity => EntitySwappableService.findSwappable(entity) || entity);

        this.addMetadata({
            type: 'entities',
            constructors: entities,
            cli: options.cli,
            connection: options.connection,
        });

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forFeature(entities, options?.connection || DEFAULT_CONNECTION_NAME)],
            exports: [TypeOrmModule],
        };
    }

    static withMigrations(
        migrations: Function[] | object = [],
        options: Pick<Metadata, 'cli' | 'connection'> = {},
    ): DynamicModule {
        let constructors;

        if (Array.isArray(migrations)) {
            constructors = migrations;
        } else {
            constructors = Object.keys(migrations)
                .filter(value => typeof migrations[value] === 'function')
                .map(value => migrations[value]);
        }

        this.addMetadata({
            type: 'migrations',
            constructors,
            cli: options.cli,
            connection: options.connection,
        });
        return { module: DatabaseModule };
    }

    private static extendDatabaseOptions(connection: string, databaseOptions: DatabaseModuleOptions) {
        const metadata = MetadataStorageService.getMetadataByConnection(connection);

        if (!metadata) {
            return databaseOptions;
        }

        let entities = databaseOptions.entities || [];
        let migrations = databaseOptions.migrations || [];

        for (const item of metadata) {
            if (item.type === 'entities' && item.constructors) {
                const entitiesNames = entities
                    .filter(entity => typeof entity === 'function')
                    .map(entity => (entity as Function).name);

                entities = entities.concat(
                    item.constructors.filter(entity => !entitiesNames.includes(entity.name)),
                );
            }

            if (item.type === 'migrations' && item.constructors) {
                const migrationsNames = entities
                    .filter(migration => typeof migration === 'function')
                    .map(migration => (migration as Function).name);

                migrations = migrations.concat(
                    item.constructors.filter(migration => !migrationsNames.includes(migration.name)),
                );
            }
        }

        return { ...databaseOptions, entities, migrations };
    }

    private static addMetadata(metadata: Metadata) {
        if (!metadata.connection) {
            metadata.connection = DEFAULT_CONNECTION_NAME;
        }
        MetadataStorageService.addMetadata(metadata);
    }
}
