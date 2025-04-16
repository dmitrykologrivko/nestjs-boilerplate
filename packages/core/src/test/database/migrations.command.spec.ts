import { mock, MockProxy } from 'jest-mock-extended';
import { MigrationsCommand } from '../../database/migrations.command';
import { TypeormCommandExecutorService } from '../../database/typeorm-command-executor.service';
import { DEFAULT_DATA_SOURCE_NAME } from '../../database/database.constants';

describe('MigrationsCommand', () => {
    let mockExecutor: MockProxy<TypeormCommandExecutorService>;
    let migrationsCommand: MigrationsCommand;

    beforeEach(() => {
        mockExecutor = mock<TypeormCommandExecutorService>();
        migrationsCommand = new MigrationsCommand(mockExecutor);
    });

    describe('#createMigration()', () => {
        it('should call createMigration with correct arguments', async () => {
            const migrationName = 'TestMigration';
            const destination = 'src/migrations';
            const dataSource = DEFAULT_DATA_SOURCE_NAME;

            await migrationsCommand.createMigration(migrationName, dataSource, destination);

            expect(mockExecutor.createMigration).toHaveBeenCalledWith(
                migrationName,
                destination,
                dataSource
            );
        });
    });

    describe('#generateMigration()', () => {
        it('should call generateMigration with correct arguments', async () => {
            const migrationName = 'AutoMigration';
            const destination = 'src/migrations';
            const dataSource = DEFAULT_DATA_SOURCE_NAME;

            await migrationsCommand.generateMigration(migrationName, dataSource, destination);

            expect(mockExecutor.generateMigration).toHaveBeenCalledWith(
                migrationName,
                destination,
                dataSource
            );
        });
    });

    describe('#runMigrations()', () => {
        it('should call runMigrations with correct arguments', async () => {
            const dataSource = DEFAULT_DATA_SOURCE_NAME;
            const fake = false;

            await migrationsCommand.runMigrations(dataSource, fake);

            expect(mockExecutor.runMigrations).toHaveBeenCalledWith(dataSource, fake);
        });
    });

    describe('#revertMigration()', () => {
        it('should call revertMigration with correct arguments', async () => {
            const dataSource = DEFAULT_DATA_SOURCE_NAME;
            const fake = false;

            await migrationsCommand.revertMigration(dataSource, fake);

            expect(mockExecutor.revertMigration).toHaveBeenCalledWith(dataSource, fake);
        });
    });

    describe('#showMigrations()', () => {
        it('should call showMigrations with correct arguments', async () => {
            const dataSource = DEFAULT_DATA_SOURCE_NAME;

            await migrationsCommand.showMigrations(dataSource);

            expect(mockExecutor.showMigrations).toHaveBeenCalledWith(dataSource);
        });
    });
});