import { execSync } from 'child_process';

describe('Management', () => {
    it('should run default handler successfully', async () => {
        const nickname = `${Math.random()}}`;
        const command = `./node_modules/.bin/ts-node ./packages/core/e2e/management/src/main.ts --command greetings --nickname ${nickname}`;

        const output = execSync(command);
        expect(output.toString()).toContain(`Hello ${nickname}!`);
    });

    it('should run specified handler successfully', async () => {
        const firstName = `${Math.random()}}`;
        const lastName = `${Math.random()}}`;
        const command = `./node_modules/.bin/ts-node ./packages/core/e2e/management/src/main.ts --command greetings:person --firstName ${firstName} --lastName ${lastName}`;

        const output = execSync(command);
        expect(output.toString()).toContain(`Hello ${firstName} ${lastName}!`);
    });
});
