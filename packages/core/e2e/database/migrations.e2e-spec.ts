import { rmSync, mkdirSync, writeFileSync } from 'fs';
import { normalize } from 'path';
import { execSync } from 'child_process';

describe('Migrations (e2e)', () => {
    const executor = normalize('./node_modules/.bin/ts-node');
    const script = normalize('./packages/core/e2e/database/migrations-src/main.ts');
    const destination = normalize('./packages/core/e2e/database/migrations-src/migrations');

    function stripAnsi(str: string) {
        // Strip ANSI escape codes using regex
        return str.replace(/\x1b\[[0-9;]*m/g, '');
    }

    function clearMigrations() {
        // Clear the migrations directory
        rmSync(destination, { recursive: true, force: true });
        mkdirSync(destination, { recursive: true });
        writeFileSync(normalize(`${destination}/index.ts`), '');
    }

    async function createMigrationAndDoCheck() {
        const createCommand = `--command migrations:create --destination=${destination} --name=TestMigration`;

        const output = execSync(`${executor} ${script} ${createCommand}`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toMatch(/Migration .*-TestMigration\.ts has been generated successfully\./);
    }

    async function generateMigrationAndDoCheck() {
        const output = execSync(
            `${executor} ${script} --command migrations:generate --destination=${destination}`
        );
        const outputStr = stripAnsi(output.toString());
        const timestamp = outputStr.match(
            /Migration .*\/(\d+)-auto\.ts has been generated successfully\./
        )?.[1];

        expect(outputStr).toMatch(/Migration .* has been generated successfully\./);

        return `Auto${timestamp}`;
    }

    async function runMigrationsAndDoCheck(migrationName: string) {
        const output = execSync(`${executor} ${script} --command migrations:run`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toContain('Running pending migrations');
        expect(outputStr).toContain(`Applied: ${migrationName}`);
    }

    async function showMigrationsAndDoCheck(migrationName: string) {
        const output = execSync(`${executor} ${script} --command migrations:show`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toContain(`[ ] ${migrationName}`);
    }

    async function revertLastMigrationAndDoCheck() {
        const output = execSync(`${executor} ${script} --command migrations:revert`);
        const outputStr = stripAnsi(output.toString());

        expect(outputStr).toContain('Last migration is unloaded');
    }

    beforeAll(() => clearMigrations());
    afterEach(() => clearMigrations());

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
