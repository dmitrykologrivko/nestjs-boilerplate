import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as glob from 'glob';

function getProjectVersion(): string {
    const file = readFileSync(resolve(__dirname, 'lerna.json'));
    return JSON.parse(file.toString())?.version;
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

glob(`${resolve(__dirname, 'packages')}/*/package.json`, {}, (err, paths) => {
    if (err) {
        throw err;
    }
    updatePeerVersions(paths, getProjectVersion());
});
