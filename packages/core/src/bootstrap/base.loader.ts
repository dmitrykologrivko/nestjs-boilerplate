import { INestApplicationContext } from '@nestjs/common';

export abstract class BaseLoader<T extends INestApplicationContext = INestApplicationContext> {

    abstract load(container: T): Promise<void>;

}
