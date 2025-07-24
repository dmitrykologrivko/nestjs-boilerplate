import * as fs from 'fs';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { ModuleRef } from '@nestjs/core';
import { Logger, Injectable } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { MetadataStorageService } from './metadata-storage.service';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exec = promisify(childProcess.exec);

export enum TypeormCommands {
    MIGRATION_CREATE = 'migration:create',
    MIGRATION_GENERATE = 'migration:generate',
    MIGRATION_RUN = 'migration:run',
    MIGRATION_SHOW = 'migration:show',
    MIGRATION_REVERT = 'migration:revert',
}

@Injectable()
export class TypeormCommandExecutorService {

    private readonly configName: string;
    private readonly configPath: string;

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly metadataStorage: MetadataStorageService,
    ) {
        this.configName = 'typeorm.config.ts';
        this.configPath = `${process.cwd()}/${this.configName}`;
    }

    /**
     * Creates database migrations. Current database connection herewith will be closed.
     * Use this function only with management scripts.
     * @param migrationName migration name
     * @param destination directory where migration should be created
     * @param dataSourceName name of data source
     */
    async createMigration(
        migrationName: string,
        destination: string,
        dataSourceName: string
    ) {
        const args = `${destination}/${migrationName}`;
        await this.executeCommand(TypeormCommands.MIGRATION_CREATE, args, dataSourceName, false);
        await this.createIndexFile(destination);
    }

    /**
     * Generates database migrations. Current database connection herewith will be closed.
     * Use this function only with management scripts.
     * @param migrationName migration name
     * @param destination directory where migration should be created
     * @param dataSourceName name of data source
     */
    async generateMigration(
        migrationName: string,
        destination: string,
        dataSourceName: string
    ) {
        const args = `${destination}/${migrationName}`;
        await this.executeCommand(TypeormCommands.MIGRATION_GENERATE, args, dataSourceName);
        await this.createIndexFile(destination);
    }

    /**
     * Runs database migrations. Current database connection herewith will be closed.
     * Use this function only with management scripts.
     * @param dataSourceName name of data source
     * @param fake flag to add the migration to the migrations table without running it
     */
    async runMigrations(dataSourceName: string, fake: boolean = false) {
        const dataSource = this.getDataSourceByName(dataSourceName);

        Logger.log('Running pending migrations');
        const migrations = await dataSource.runMigrations({ fake });

        if (migrations.length === 0) {
            Logger.log('No migrations to apply');
        } else {
            Logger.log(`Applied: ${migrations.map(migration => migration.name).join(', ')}`);
        }

        // Safety close current database connection
        await dataSource.destroy();
    }

    /**
     * This command will execute down in the latest executed migration.
     * If you need to revert multiple migrations you must call this command multiple times.
     * @param dataSourceName
     * @param fake
     */
    async revertMigration(dataSourceName: string, fake: boolean = false) {
        const dataSource = this.getDataSourceByName(dataSourceName);

        await dataSource.undoLastMigration({ fake });
        Logger.log('Last migration is unloaded');

        // Safety close current database connection
        await dataSource.destroy();
    }

    /**
     * Prints the lists all migrations and whether they have been run.
     * @param dataSourceName name of data source
     */
    async showMigrations(dataSourceName: string) {
        const dataSource = this.getDataSourceByName(dataSourceName);

        dataSource.setOptions({
            ...dataSource.options,
            subscribers: [],
            synchronize: false,
            migrationsRun: false,
            dropSchema: false,
            logging: ['schema']
        });

        await dataSource.showMigrations();

        // Safety close current database connection
        await dataSource.destroy();
    }

    /**
     * Executes typeorm cli command
     * @param typeormCommand typeorm cli command
     * @param args command arguments
     * @param dataSourceName name of data source
     * @param useConfig should export data source options to ts file before running the command
     * @private
     */
    private async executeCommand(
        typeormCommand: TypeormCommands,
        args: string,
        dataSourceName: string,
        useConfig: boolean = true
    ) {
        const dataSource = this.getDataSourceByName(dataSourceName);

        if (useConfig) {
            await this.exportConfig(dataSourceName, dataSource.options);
        }

        // Safety close current database connection
        await dataSource.destroy();

        // Execute cli command
        const executor = 'typeorm-ts-node-commonjs';
        const command = `${executor} ${useConfig ? `-d ${this.configPath}` : ''} ${typeormCommand} ${args}`;

        try {
            const { stdout, stderr } = await exec(command);

            // Log result
            if (stdout) {
                Logger.verbose(stdout);
            }
            if (stderr) {
                Logger.error(stderr);
            }
        } catch (error) {
            Logger.error(error);
        }

        if (useConfig) {
            await this.deleteConfig();
        }
    }

    /**
     * Creates temp typeorm config file for typeorm cli
     * @param dataSourceName data source name
     * @param options data source options
     * @private
     */
    private async exportConfig(dataSourceName: string, options: DataSourceOptions) {
        const metadata = this.metadataStorage.getMetadataByDataSource(dataSourceName);

        let entities = options.entities || [];
        let migrations = options.migrations || [];

        for (const item of metadata) {
            if (item.type === 'entities' && item.cli) {
                let paths = [];

                if (Array.isArray(item.cli)) {
                    paths = paths.concat(item.cli);
                } else {
                    paths.push(item.cli);
                }

                if (Array.isArray(entities)) {
                    entities = entities.concat(paths);
                } else {
                    paths.forEach(path => {
                        entities[path] = path;
                    });
                }
            }

            if (item.type === 'migrations' && item.cli) {
                let paths = [];

                if (Array.isArray(item.cli)) {
                    paths = paths.concat(item.cli);
                } else {
                    paths.push(item.cli);
                }

                if (Array.isArray(migrations)) {
                    migrations = migrations.concat(paths);
                } else {
                    paths.forEach(path => {
                        migrations[path] = path;
                    });
                }
            }
        }

        if (Array.isArray(entities)) {
            entities = entities.filter(entity => typeof entity === 'string');
        } else {
            entities = Object.keys(entities)
                .filter(key => typeof entities[key] === 'string')
                .map(key => entities[key] as string);
        }

        if (Array.isArray(migrations)) {
            migrations = migrations.filter(migration => typeof migration === 'string');
        } else {
            migrations = Object.keys(migrations)
                .filter(key => typeof migrations[key] === 'string')
                .map(key => migrations[key] as string);
        }

        const config = `
            import { DataSource } from 'typeorm';
            export default new DataSource(
                ${JSON.stringify({ ...options, entities, migrations })}
            );
        `;

        await writeFile(this.configPath, config);
    }

    /**
     * Deletes temp typeorm config file generated for typeorm cli
     * @private
     */
    private async deleteConfig() {
        await unlink(this.configPath);
    }

    /**
     * Creates index.ts file for provided path to source files folder
     * @param path source files folder path
     */
    private async createIndexFile(path: string) {
        const { stderr } = await exec(`cti create -w -b ${path}`);

        if (stderr) {
            Logger.error(stderr);
        }
    }

    private getDataSourceByName(name: string): DataSource {
        const dataSource = this.moduleRef.get<DataSource>(getDataSourceToken(name) as string, { strict: false });

        if (dataSource) {
            return dataSource;
        }

        throw new Error(`${name} data source does not exist`);
    }
}
