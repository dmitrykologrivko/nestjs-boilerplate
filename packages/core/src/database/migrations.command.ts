import {
    Command,
    Handler,
    CliArgument,
} from '../management/management.decorators';
import { TypeormCommandExecutorService } from './typeorm-command-executor.service';
import { DEFAULT_DATA_SOURCE_NAME } from './database.constants';

@Command({ name: 'migrations' })
export class MigrationsCommand {
    constructor(
        private readonly commandsExecutor: TypeormCommandExecutorService,
    ) {}

    @Handler({ shortcut: 'create' })
    async createMigration(
        @CliArgument({ name: 'name' })
        migrationName: string,

        @CliArgument({
            name: 'dataSource',
            optional: true,
            defaultValue: DEFAULT_DATA_SOURCE_NAME,
        })
        dataSource?: string,

        @CliArgument({
            name: 'destination',
            optional: true,
        })
        destination: string = 'src/migrations',
    ) {
        await this.commandsExecutor.createMigration(
            migrationName,
            destination,
            dataSource
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
            name: 'dataSource',
            optional: true,
            defaultValue: DEFAULT_DATA_SOURCE_NAME,
        })
        dataSource?: string,

        @CliArgument({
            name: 'destination',
            optional: true,
        })
        destination: string = 'src/migrations',
    ) {
        await this.commandsExecutor.generateMigration(
            migrationName,
            destination,
            dataSource
        );
    }

    @Handler({ shortcut: 'run' })
    async runMigrations(
        @CliArgument({
            name: 'dataSource',
            optional: true,
            defaultValue: DEFAULT_DATA_SOURCE_NAME,
        })
        dataSource?: string,

        @CliArgument({
            name: 'fake',
            optional: true,
            defaultValue: false,
        })
        fake?: boolean,
    ) {
        await this.commandsExecutor.runMigrations(dataSource, fake);
    }

    @Handler({ shortcut: 'revert' })
    async revertMigration(
        @CliArgument({
            name: 'dataSource',
            optional: true,
            defaultValue: DEFAULT_DATA_SOURCE_NAME,
        })
        dataSource?: string,

        @CliArgument({
            name: 'fake',
            optional: true,
            defaultValue: false,
        })
        fake?: boolean,
    ) {
        await this.commandsExecutor.revertMigration(dataSource, fake);
    }

    @Handler({ shortcut: 'show' })
    async showMigrations(
        @CliArgument({
            name: 'dataSource',
            optional: true,
            defaultValue: DEFAULT_DATA_SOURCE_NAME,
        })
        dataSource?: string
    ) {
        await this.commandsExecutor.showMigrations(dataSource);
    }
}
