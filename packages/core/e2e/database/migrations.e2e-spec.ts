import { rmSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { normalize } from 'path';
import { execSync } from 'child_process';

describe('Migrations (e2e)', () => {
    const executorPath = normalize('./node_modules/.bin/ts-node');
    const scriptPath = normalize('./packages/core/e2e/database/migrations-src/main.ts');
    const destinationPath = normalize('./packages/core/e2e/database/migrations-src/migrations');
    const databasePath = normalize('./database');

    function stripAnsi(str: string) {
        // Strip ANSI escape codes using regex
        return str.replace(/\x1b\[[0-9;]*m/g, '');
    }

    function clear() {
        // Clear database file
        if (existsSync(databasePath)) {
            rmSync(normalize('./database'));
        }
        // Clear the migrations directory
        rmSync(destinationPath, { recursive: true, force: true });
        mkdirSync(destinationPath, { recursive: true });
        writeFileSync(normalize(`${destinationPath}/index.ts`), '');
    }

    async function createMigrationAndDoCheck() {
        const createCommand = `--command migrations:create --destination=${destinationPath} --name=TestMigration`;

        const output = execSync(`${executorPath} ${scriptPath} ${createCommand}`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toMatch(/Migration .*-TestMigration\.ts has been generated successfully\./);
    }

    async function generateMigrationAndDoCheck() {
        const output = execSync(
            `${executorPath} ${scriptPath} --command migrations:generate --destination=${destinationPath}`
        );
        const outputStr = stripAnsi(output.toString());
        const timestamp = outputStr.match(
            /Migration .*\/(\d+)-auto\.ts has been generated successfully\./
        )?.[1];

        expect(outputStr).toMatch(/Migration .* has been generated successfully\./);

        return `Auto${timestamp}`;
    }

    async function runMigrationsAndDoCheck(migrationName: string) {
        const output = execSync(`${executorPath} ${scriptPath} --command migrations:run`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toContain('Running pending migrations');
        expect(outputStr).toContain(`Applied: ${migrationName}`);
    }

    async function showMigrationsAndDoCheck(migrationName: string) {
        const output = execSync(`${executorPath} ${scriptPath} --command migrations:show`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toContain(`[X] 1 ${migrationName}`);
    }

    async function revertLastMigrationAndDoCheck() {
        const output = execSync(`${executorPath} ${scriptPath} --command migrations:revert`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toContain('Last migration is unloaded');
    }

    beforeAll(() => clear());
    afterEach(() => clear());

    it('should create migration', async () => {
        await createMigrationAndDoCheck();
    });

    it('should generate migration', async () => {
        await generateMigrationAndDoCheck();
    });

    it('should generate -> run migration', async () => {
        const migrationName = await generateMigrationAndDoCheck();
        await runMigrationsAndDoCheck(migrationName);
    });

    it('should generate -> run -> show migration', async () => {
        const migrationName = await generateMigrationAndDoCheck();
        await runMigrationsAndDoCheck(migrationName);
        await showMigrationsAndDoCheck(migrationName);
    });

    it('should generate -> run -> revert migration', async () => {
        const migrationName = await generateMigrationAndDoCheck();
        await runMigrationsAndDoCheck(migrationName);
        await revertLastMigrationAndDoCheck();
    });
});
