import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Constructor } from '../utils/type.utils';
import { ConfigModule } from '../config/config.module';
import { Property } from '../config/property.interface';
import { PropertyConfigService } from '../config/property-config.service';
import { TFunction } from '../utils/type.utils';
import { DEFAULT_DATA_SOURCE_NAME } from './database.constants';
import { DEFAULT_DATABASE_PROPERTY } from './database.properties';
import { MigrationsCommand } from './migrations.command';
import { TypeormCommandExecutorService } from './typeorm-command-executor.service';
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
        TypeormCommandExecutorService,
    ],
})
export class DatabaseModule {

    static withOptions(options: DatabaseModuleOptions[]): DynamicModule {
        return {
            module: DatabaseModule,
            imports: options.map(value => (
                TypeOrmModule.forRoot(
                    this.extendDatabaseOptions(
                        value.name || DEFAULT_DATA_SOURCE_NAME,
                        value,
                    ),
                )
            )),
            exports: [TypeOrmModule]
        };
    }

    static withConfig(
        configMappings: { property: Property<DatabaseModuleOptions>, name: string }[] = [{
            property: DEFAULT_DATABASE_PROPERTY,
            name: DEFAULT_DATA_SOURCE_NAME
        }],
    ): DynamicModule {
        return {
            module: DatabaseModule,
            imports: configMappings.map(value => (
                TypeOrmModule.forRootAsync({
                    name: value.name,
                    imports: [ConfigModule],
                    useFactory: (config: PropertyConfigService) => {
                        const options = config.get(value.property);
                        return this.extendDatabaseOptions(
                            options.name || DEFAULT_DATA_SOURCE_NAME,
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
        entities: TFunction[] = [],
        options: Pick<Metadata, 'cli' | 'dataSource'> = {},
    ): DynamicModule {
        entities = entities.map(entity => EntitySwappableService.findSwappable(entity) || entity);

        this.addMetadata({
            type: 'entities',
            constructors: entities,
            cli: options.cli,
            dataSource: options.dataSource,
        });

        return {
            module: DatabaseModule,
            imports: [TypeOrmModule.forFeature(entities, options?.dataSource || DEFAULT_DATA_SOURCE_NAME)],
            exports: [TypeOrmModule],
        };
    }

    static withMigrations(
        migrations: TFunction[] | { [key: string]: TFunction } = [],
        options: Pick<Metadata, 'cli' | 'dataSource'> = {},
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
            dataSource: options.dataSource,
        });

        return { module: DatabaseModule };
    }

    private static extendDatabaseOptions(dataSource: string, databaseOptions: DatabaseModuleOptions) {
        const metadata = MetadataStorageService.getMetadataByDataSource(dataSource);

        if (!metadata) {
            return databaseOptions;
        }

        let entities = databaseOptions.entities || [];
        let entityNames = [];

        if (Array.isArray(entities)) {
            entityNames = entities
                .filter(entity => typeof entity === 'function')
                .map(entity => entity.name);
        } else {
            entityNames = Object.keys(entities)
                .filter(key => typeof entities[key] === 'function')
                .map(key => (entities[key] as Constructor).name);
        }

        let migrations = databaseOptions.migrations || [];
        let migrationNames = [];

        if (Array.isArray(migrations)) {
            migrationNames = migrations
                .filter(migration => typeof migration === 'function')
                .map(migration => migration.name);
        } else {
            migrationNames = Object.keys(migrations)
                .filter(key => typeof migrations[key] === 'function')
                .map(key => (migrations[key] as Constructor).name);
        }

        for (const item of metadata) {
            if (item.type === 'entities' && item.constructors) {
                const notRegisteredEntities = item.constructors
                    .filter(entity => !entityNames.includes(entity.name));

                if (Array.isArray(entities)) {
                    entities = entities.concat(notRegisteredEntities);
                } else {
                    notRegisteredEntities.forEach(entity => {
                        entities[entity.name] = entity;
                    });
                }
            }

            if (item.type === 'migrations' && item.constructors) {
                const notRegisteredMigrations = item.constructors
                    .filter(migration => !migrationNames.includes(migration.name));

                if (Array.isArray(migrations)) {
                    migrations = migrations.concat(notRegisteredMigrations);
                } else {
                    notRegisteredMigrations.forEach(migration => {
                        migrations[migration.name] = migration;
                    });
                }
            }
        }

        return { ...databaseOptions, entities, migrations };
    }

    private static addMetadata(metadata: Metadata) {
        if (!metadata.dataSource) {
            metadata.dataSource = DEFAULT_DATA_SOURCE_NAME;
        }
        MetadataStorageService.addMetadata(metadata);
    }
}
