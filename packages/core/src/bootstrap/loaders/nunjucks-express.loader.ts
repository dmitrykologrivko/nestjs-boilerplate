import { INestApplicationContext } from '@nestjs/common';
import { NUNJUCKS_TOKEN } from '../../template/template.constants';
import { BaseBootstrapperLoader } from '../base-bootstrapper.loader';

export class NunjucksExpressLoader extends BaseBootstrapperLoader {

    async load(container: INestApplicationContext): Promise<void> {
        container.get(NUNJUCKS_TOKEN)?.express(container);
    }
}
