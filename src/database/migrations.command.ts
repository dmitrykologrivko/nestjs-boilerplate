import { ModuleRef } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/typeorm';
import { Connection, ConnectionOptions } from 'typeorm';
import {
    Command,
    Handler,
    CliArgument,
} from '../management/management.decorators';
import {
    createMigration,
    generateMigration,
    runMigrations,
} from './typeorm.utils';
import { EntityMetadataStorage } from './entity-metadata-storage.service';
import { DEFAULT_CONNECTION_NAME } from './database.constants';

@Command({ name: 'migrations' })
export class MigrationsCommand {
    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly metadataStorage: EntityMetadataStorage,
    ) {}

    @Handler({ shortcut: 'create' })
    async createMigration(
        @CliArgument({ name: 'name' })
        migrationName: string,

        @CliArgument({
            name: 'connection',
            optional: true,
            defaultValue: DEFAULT_CONNECTION_NAME,
        })
        connectionName?: string,

        @CliArgument({
            name: 'destination',
            optional: true,
        })
        destination?: string,

        @CliArgument({
            name: 'useTypescript',
            optional: true,
            defaultValue: false,
        })
        useTypescript?: boolean,
    ) {
        const connection = this.getConnectionByName(connectionName);
        const commandOptions = {
            useTypescript,
            connectionOptions: this.overrideConnectionOptions(connection),
        };

        await createMigration(
            connection,
            migrationName,
            destination,
            commandOptions,
        );
    }

    @Handler({ shortcut: 'generate' })
    async generateMigration(
        @CliArgument({
            name: 'name',
            optional: true,
            defaultValue: 'auto',
        })
        migrationName: string,

        @CliArgument({
            name: 'connection',
            optional: true,
            defaultValue: DEFAULT_CONNECTION_NAME,
        })
        connectionName?: string,

        @CliArgument({
            name: 'destination',
            optional: true,
        })
        destination?: string,

        @CliArgument({
            name: 'useTypescript',
            optional: true,
            defaultValue: false,
        })
        useTypescript?: boolean,
    ) {
        const connection = this.getConnectionByName(connectionName);
        const commandOptions = {
            useTypescript,
            connectionOptions: this.overrideConnectionOptions(connection),
        };

        await generateMigration(
            connection,
            migrationName,
            destination,
            commandOptions,
        );
    }

    @Handler({ shortcut: 'run' })
    async runMigrations(
        @CliArgument({
            name: 'connection',
            optional: true,
            defaultValue: DEFAULT_CONNECTION_NAME,
        })
        connection?: string,
    ) {
        await runMigrations(this.getConnectionByName(connection));
    }

    private getConnectionByName(name: string) {
        const connection = this.moduleRef.get(getConnectionToken(name) as string, { strict: false });

        if (connection) {
            return connection;
        }

        throw new Error(`${name} connection does not exist`);
    }

    private overrideConnectionOptions(connection: Connection): ConnectionOptions {
        const entityOptions = this.metadataStorage.getEntityOptionsByConnection(connection);

        if (!entityOptions) {
            return connection.options;
        }

        let entities = connection.options.entities || [];
        let migrations = connection.options.migrations || [];

        for (const options of entityOptions) {
            if (options.cli?.entities) {
                if (Array.isArray(options.cli.entities)) {
                    entities = entities.concat(options.cli.entities);
                } else {
                    entities.push(options.cli.entities);
                }
            }

            if (options.cli?.migrations) {
                if (Array.isArray(options.cli.migrations)) {
                    migrations = migrations.concat(options.cli.migrations);
                } else {
                    migrations.push(options.cli.migrations);
                }
            }
        }

        return { ...connection.options, entities, migrations };
    }
}
