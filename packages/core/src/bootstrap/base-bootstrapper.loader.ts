import { INestApplicationContext } from '@nestjs/common';

export abstract class BaseBootstrapperLoader<T extends INestApplicationContext = INestApplicationContext> {

    async abstract load(container: T): Promise<void>;

}
