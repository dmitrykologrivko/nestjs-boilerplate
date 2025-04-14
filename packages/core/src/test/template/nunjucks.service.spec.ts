import { Environment } from 'nunjucks';
import { MockProxy, mock } from 'jest-mock-extended';
import { NunjucksService } from '../../template/nunjucks.service';

describe('NunjucksService', () => {
    let service: NunjucksService;
    let nunjucksMock: MockProxy<Environment>;

    beforeEach(() => {
        nunjucksMock = mock<Environment>();

        service = new NunjucksService(nunjucksMock);
    });

    describe('#render', () => {
        it('should call nunjucks.render with the correct arguments', async () => {
            const template = 'template.njk';
            const context = { key: 'value' };
            const renderedOutput = 'Rendered Content';

            nunjucksMock.render.mockImplementation((tpl, ctx) => {
                expect(tpl).toBe(template);
                expect(ctx).toEqual(context);
                return renderedOutput;
            });

            const result = await service.render(template, context);

            expect(result).toBe(renderedOutput);
            expect(nunjucksMock.render).toHaveBeenCalledWith(template, context);
        });
    });
});
