import { Inject } from '@nestjs/common';
import { Environment } from 'nunjucks';
import { InfrastructureService } from '../utils/infrastructure-service.decorator';
import { BaseTemplateService } from './base-template.service';
import { NUNJUCKS_TOKEN } from './template.constants';

@InfrastructureService()
export class NunjucksService extends BaseTemplateService {
    constructor(
        @Inject(NUNJUCKS_TOKEN)
        protected readonly nunjucks: Environment,
    ) {
        super();
    }

    async render(template: string, context?: object): Promise<string> {
        return Promise.resolve(
            this.nunjucks.render(template, context)
        );
    }
}
