import { INestApplication } from '@nestjs/common';
import { NUNJUCKS_TOKEN } from '../../template/template.constants';
import { AbstractExpressLoader } from './abstract-express.loader';

export class NunjucksExpressLoader extends AbstractExpressLoader {
    constructor() {
        super('NunjucksExpressLoader');
    }

    async load(container: INestApplication): Promise<void> {
        await super.load(container);
        container.get(NUNJUCKS_TOKEN)?.express(container);
    }
}
