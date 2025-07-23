import { Injectable, Module, ModuleMetadata, Global } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Environment } from 'nunjucks';
import { TemplateModule } from '../../template/template.module';
import { BaseTemplateService } from '../../template/base-template.service';
import { NunjucksService } from '../../template/nunjucks.service';
import { TEMPLATE_PATHS_TOKEN, NUNJUCKS_TOKEN } from '../../template/template.constants';

describe('TemplateModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(metadata: ModuleMetadata): Promise<TestingModule> {
        module = await Test.createTestingModule(metadata).compile();
        return module;
    }

    afterEach(async () => {
        if (module) await module.close();
    });

    it('should register services in the module', async () => {
        module = await createTestingModule({
            imports: [
                TemplateModule,
            ]
        });

        const templatePaths = module.get(TEMPLATE_PATHS_TOKEN);

        expect(templatePaths).toBeDefined();
        expect(templatePaths).toBeInstanceOf(Array);
        expect(templatePaths.length).toBe(0);
    });

    describe('#forRoot()', () => {
        it('should register NunjucksService as BaseTemplateService by default', async () => {
            module = await createTestingModule({
                imports: [
                    TemplateModule.forRoot(),
                ]
            });

            const service = module.get(BaseTemplateService);

            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(NunjucksService);
        });

        it('should register NunjucksService', async () => {
            module = await createTestingModule({
                imports: [
                    TemplateModule.forRoot(),
                ]
            });

            const service = module.get(NunjucksService);

            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(NunjucksService);
        });

        it('should allow overriding BaseTemplateService with custom implementation', async () => {
            @Injectable()
            class TestTemplateService extends BaseTemplateService {
                render(template: string, context?: object): Promise<string> {
                    return Promise.resolve('');
                }
            }

            @Global()
            @Module({
                providers: [
                    TestTemplateService,
                ],
                exports: [
                    TestTemplateService,
                ]
            })
            class TestTemplateModule {}

            await createTestingModule({
                imports: [
                    TestTemplateModule,
                    TemplateModule.forRoot({
                        service: TestTemplateService,
                    }),
                ]
            });

            const service = module.get(BaseTemplateService);
            const nunjucksService = module.get(NunjucksService);
            const testService = module.get(TestTemplateService);

            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(TestTemplateService);
            expect(nunjucksService).toBeDefined();
            expect(nunjucksService).toBeInstanceOf(NunjucksService);
            expect(testService).toBeDefined();
            expect(testService).toBeInstanceOf(TestTemplateService);
            expect(testService).toBe(service);
        });

        it('should register Environment from nunjucks', async () => {
            await createTestingModule({
                imports: [
                    TemplateModule.forRoot(),
                ]
            });

            const env = module.get(NUNJUCKS_TOKEN);

            expect(env).toBeDefined();
            expect(env).toBeInstanceOf(Environment);
        });
    });

    describe('#forFeature()', () => {
        it('should register custom paths', async () => {
            await createTestingModule({
                imports: [
                    TemplateModule.forFeature(['feature1', 'feature2']),
                    TemplateModule.forRoot({
                        path: ['path1', 'path2'],
                    }),
                ]
            });

            const paths = module.get(TEMPLATE_PATHS_TOKEN);

            expect(paths).toBeDefined();
            expect(paths).toBeInstanceOf(Array);
            expect(paths.length).toBe(4);
            expect(paths).toContain('path1');
            expect(paths).toContain('path2');
            expect(paths).toContain('feature1');
            expect(paths).toContain('feature2');
        });
    });
});
