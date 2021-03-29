export abstract class BaseTemplateService {

    abstract async render(template: string, context?: object): Promise<string>;

}
