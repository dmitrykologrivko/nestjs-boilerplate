import { execSync } from 'child_process';

describe('Management Bootstrap (e2e)', () => {
    it('should command run successfully', async () => {
        const name = `John-${Math.random()}}`;
        const command = `./node_modules/.bin/ts-node ./packages/core/e2e/bootstrap/management-src/main.ts --command greetings --name ${name}`;

        const output = execSync(command);
        expect(output.toString()).toContain(`Hello ${name}!`);
    });
});
