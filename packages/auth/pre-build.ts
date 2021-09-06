import {
    copyFileSync,
    readFileSync,
    writeFileSync,
} from 'fs';

const PACKAGE_TEST_DIR = `${process.cwd()}/src/test`;

const USER_MODULE_IMPORT = `from '@nestjs-boilerplate/user'`;
const REPLACE_IMPORT_REGEX = /from.+'(\.\..*)'|"(.*)"/g;

function makeUserFactory() {
    const USER_FACTORY_SRC_PATH = `${__dirname}/../user/src/test/user.factory.ts`;
    const USER_FACTORY_DIST_PATH = `${PACKAGE_TEST_DIR}/user.factory.ts`;

    copyFileSync(USER_FACTORY_SRC_PATH, USER_FACTORY_DIST_PATH);
    writeFileSync(
        USER_FACTORY_DIST_PATH,
        readFileSync(USER_FACTORY_DIST_PATH, { encoding: 'utf8', flag: 'r' })
            .replace(REPLACE_IMPORT_REGEX, USER_MODULE_IMPORT),
    );
}

// Make source files
makeUserFactory();
