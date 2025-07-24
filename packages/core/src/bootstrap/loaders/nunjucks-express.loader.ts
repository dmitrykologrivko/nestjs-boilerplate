import { INestApplication } from '@nestjs/common';
import { Environment } from 'nunjucks';
import { NUNJUCKS_TOKEN } from '../../template/template.constants';
import { AbstractExpressLoader } from './abstract-express.loader';

export class NunjucksExpressLoader extends AbstractExpressLoader {
    constructor() {
        super(NunjucksExpressLoader.name);
    }

    async load(container: INestApplication): Promise<void> {
        await super.load(container);
        container.get<Environment>(NUNJUCKS_TOKEN)?.express(container);
    }
}
