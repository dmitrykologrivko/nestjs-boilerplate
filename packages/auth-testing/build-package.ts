import {
    copyFileSync,
    mkdirSync,
    rmdirSync,
    existsSync,
    readFileSync,
    writeFileSync,
} from 'fs';
import { execSync } from 'child_process';

const PACKAGE_SRC_DIR = `${process.cwd()}/src`;

const AUTH_MODULE_IMPORT = `from '@nest-boilerplate/auth'`;
const REPLACE_IMPORT_REGEX = /from.+'(\.\..*)'|"(.*)"/g;

function makeUserFactory() {
    const USER_FACTORY_SRC_PATH = '../auth/src/test/user.factory.ts';
    const USER_FACTORY_DIST_PATH = `${PACKAGE_SRC_DIR}/user.factory.ts`;

    copyFileSync(USER_FACTORY_SRC_PATH, USER_FACTORY_DIST_PATH);
    writeFileSync(
        USER_FACTORY_DIST_PATH,
        readFileSync(USER_FACTORY_DIST_PATH, { encoding: 'utf8', flag: 'r' })
            .replace(REPLACE_IMPORT_REGEX, AUTH_MODULE_IMPORT),
    );
}

function makeAuthTestUtils() {
    const AUTH_TEST_UTILS_SRC_PATH = '../auth/src/test/auth-test.utils.ts';
    const AUTH_TEST_UTILS_DIST_PATH = `${PACKAGE_SRC_DIR}/auth-test.utils.ts`;

    copyFileSync(AUTH_TEST_UTILS_SRC_PATH, AUTH_TEST_UTILS_DIST_PATH);
    writeFileSync(
        AUTH_TEST_UTILS_DIST_PATH,
        readFileSync(AUTH_TEST_UTILS_DIST_PATH, { encoding: 'utf8', flag: 'r' })
            .replace(REPLACE_IMPORT_REGEX, AUTH_MODULE_IMPORT),
    );
}

// Clear source dir
if (existsSync(PACKAGE_SRC_DIR)) {
    rmdirSync(PACKAGE_SRC_DIR, { recursive: true });
}

// Make source dir
mkdirSync(PACKAGE_SRC_DIR);

// Make source files
makeUserFactory();
makeAuthTestUtils();

// Make index.ts
execSync(`cti create -w -b ${PACKAGE_SRC_DIR}`);
