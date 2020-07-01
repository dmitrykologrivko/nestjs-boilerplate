import { INestApplicationContext } from '@nestjs/common';

export interface Bootstrapper {
    container: INestApplicationContext;
    start: () => Promise<void>;
}

export interface BootstrapOptions {
    module: any;
}
