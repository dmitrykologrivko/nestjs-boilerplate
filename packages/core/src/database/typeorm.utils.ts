import * as fs from 'fs';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { Logger } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';

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

export interface TypeormCommandOptions {

    /**
     * Execute typeorm cli command through TypeScript interpreter
     */
    useTypescript?: boolean;

    /**
     * Overridden typeorm connection options
     */
    connectionOptions?: ConnectionOptions;

}

/**
 * Creates database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param migrationName migration name
 * @param destination directory where migration should be created
 * @param commandOptions options for executing typeorm migrations cli command
 */
export async function createMigration(
    connection: Connection,
    migrationName: string,
    destination?: string,
    commandOptions: TypeormCommandOptions = {},
) {
    await execTypeormCommand(
        connection,
        TypeormCommands.MIGRATION_CREATE,
        `-n ${migrationName} -c ${connection.name} ${destination ? `-d ${destination}` : ''}`,
        commandOptions,
    );

    await createIndexFile(destination || connection.options.cli?.migrationsDir);
}

/**
 * Generates database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param migrationName migration name
 * @param destination directory where migration should be created
 * @param commandOptions options for executing typeorm migrations cli command
 */
export async function generateMigration(
    connection: Connection,
    migrationName: string,
    destination?: string,
    commandOptions: TypeormCommandOptions = {},
) {
    await execTypeormCommand(
        connection,
        TypeormCommands.MIGRATION_GENERATE,
        `-n ${migrationName} -c ${connection.name} ${destination ? `-d ${destination}` : ''}`,
        commandOptions,
    );

    await createIndexFile(destination || connection.options.cli?.migrationsDir);
}

/**
 * Runs database migrations. Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 */
export async function runMigrations(connection: Connection) {
    Logger.log('Running pending migrations');
    const migrations = await connection.runMigrations();

    if (migrations.length === 0) {
        Logger.log('No migrations to apply');
    } else {
        Logger.log(`Applied: ${migrations.map(migration => migration.name).join(', ')}`);
    }

    await connection.close();
}

/**
 * Executes typeorm cli command.
 * If ormconfig.json exists then uses it else dynamically generates
 * config file and removes it after command execution.
 * Current database connection herewith will be closed.
 * Use this function only with management scripts.
 * @param connection database connection instance
 * @param command typeorm command
 * @param args typeorm command arguments
 * @param commandOptions options for executing typeorm cli command
 */
export async function execTypeormCommand(
    connection: Connection,
    command: TypeormCommands,
    args: string = '',
    commandOptions?: TypeormCommandOptions,
) {
    const options = commandOptions?.connectionOptions || connection.options;
    const entities = (options.entities || []).filter(item => typeof item === 'string');
    const migrations = (options.migrations || []).filter(item => typeof item === 'string');

    const configName = 'export_ormconfig.json';
    const configPath = `${process.cwd()}/${configName}`;

    // Create temp database config file for typeorm cli
    await writeFile(configPath, JSON.stringify({ ...options, entities, migrations }));

    // Safety close current database connection
    await connection.close();

    // Execute cli command
    const executor = commandOptions?.useTypescript
        ? './node_modules/ts-node/dist/bin.js ./node_modules/typeorm/cli.js'
        : './node_modules/typeorm/cli.js';
    const { stdout, stderr } = await exec(`${executor} ${command} ${args} -f ${configName}`);

    // Log result
    if (stdout) {
        Logger.verbose(stdout);
    }
    if (stderr) {
        Logger.error(stderr);
    }

    // Delete temp database config file
    await unlink(configPath);
}

/**
 * Creates index.ts file for provided path to source files folder
 * @param path source files folder path
 */
async function createIndexFile(path: string) {
    const { stderr } = await exec(`node ./node_modules/create-ts-index/dist/cti.js create -w -b ${path}`);

    if (stderr) {
        Logger.error(stderr);
    }
}
