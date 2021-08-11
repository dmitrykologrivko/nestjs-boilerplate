export abstract class BaseTemplateService {

    abstract render(template: string, context?: object): Promise<string>;

}
