import { rmSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { normalize } from 'path';
import { execSync } from 'child_process';

describe('UsersCommand (e2e)', () => {
    const executorPath = normalize('./node_modules/.bin/ts-node');
    const scriptPath = normalize('./packages/user/e2e/commands/src/main.ts');
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
    }

    async function createSuperuserAndDoCheck() {
        const args = '--username=admin --password=qw12ap32zb77 --firstName=John --lastName=Doe --email=example@example.com';
        const output = execSync(`${executorPath} ${scriptPath} --command users:create-superuser ${args}`);
        const outputStr = stripAnsi(output.toString());
        expect(outputStr).toContain('Superuser "admin" has been created');
    }

    async function changePasswordAndDoCheck() {
        const args = '--username=admin --password=qw12ap32zb78';
        const output = execSync(`${executorPath} ${scriptPath} --command users:change-password ${args}`);
        const outputStr = stripAnsi(output.toString());
        expect(outputStr).toContain('Password has been changed for admin');
    }

    beforeAll(() => clear());
    afterEach(() => clear());

    it('should create superuser', async () => {
        await createSuperuserAndDoCheck();
    });

    it('should change password', async () => {
        await createSuperuserAndDoCheck();
        await changePasswordAndDoCheck();
    });
});
