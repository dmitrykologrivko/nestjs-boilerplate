import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { globSync } from 'glob';

function getProjectVersion(): string {
    const file = readFileSync(resolve(__dirname, 'lerna.json'));
    return JSON.parse(file.toString())?.version as string;
}

function updatePeerVersions(paths: string[], verison: string) {
    for (const path of paths) {
        const file = readFileSync(path);
        const manifest = JSON.parse(file.toString());

        const keys = Object.keys(manifest.peerDependencies)
            .filter(value => value.includes('@nestjs-boilerplate'));

        if (keys?.length > 0) {
            keys.forEach(key => manifest.peerDependencies[key] = `^${verison}`);
            writeFileSync(path, JSON.stringify(manifest, null, 2));
        }
    }
}

const globPaths = globSync(resolve(__dirname, './packages/*/package.json'));
updatePeerVersions(globPaths, getProjectVersion());
