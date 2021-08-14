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
import { MetadataStorageService } from './metadata-storage.service';
import { DEFAULT_CONNECTION_NAME } from './database.constants';

@Command({ name: 'migrations' })
export class MigrationsCommand {
    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly metadataStorage: MetadataStorageService,
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
        destination: string = 'src/migrations',

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
        destination: string = 'src/migrations',

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
        const metadata = this.metadataStorage.getMetadataByConnection(connection);

        if (!metadata) {
            return connection.options;
        }

        let entities = connection.options.entities || [];
        let migrations = connection.options.migrations || [];

        for (const item of metadata) {
            if (item.type === 'entities' && item.cli) {
                if (Array.isArray(item.cli)) {
                    entities = entities.concat(item.cli);
                } else {
                    entities.push(item.cli);
                }
            }

            if (item.type === 'migrations' && item.cli) {
                if (Array.isArray(item.cli)) {
                    migrations = migrations.concat(item.cli);
                } else {
                    migrations.push(item.cli);
                }
            }
        }

        return { ...connection.options, entities, migrations };
    }
}
