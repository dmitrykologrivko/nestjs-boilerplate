import { Global, Module, DynamicModule } from '@nestjs/common';
import { Environment, FileSystemLoader } from 'nunjucks';
import { Constructor } from '../utils/type.utils';
import { BaseTemplateService } from './base-template.service';
import { NunjucksService } from './nunjucks.service';
import { TEMPLATE_PATHS_TOKEN, NUNJUCKS_TOKEN } from './template.constants';

const TEMPLATE_PATHS_LOADER_TOKEN = 'TEMPLATE_PATHS_LOADER_TOKEN';
const TEMPLATE_GLOBAL_PATHS_TOKEN = 'TEMPLATE_GLOBAL_PATHS_TOKEN';
const TEMPLATE_MODULE_PATHS_TOKEN = 'TEMPLATE_MODULE_PATHS_TOKEN';

export interface TemplateModuleOptions<T extends BaseTemplateService = NunjucksService> {
    service?: Constructor<T>;
    path?: string | string[];
}

@Global()
@Module({
    providers: [
        {
            provide: TEMPLATE_PATHS_TOKEN,
            useValue: [],
        },
    ],
    exports: [TEMPLATE_PATHS_TOKEN],
})
export class TemplateModule {

    static forRoot<T extends BaseTemplateService = NunjucksService>(
        options: TemplateModuleOptions<T> = {}
    ): DynamicModule {
        const templateServiceProvider = {
            provide: BaseTemplateService,
            useClass: options.service || NunjucksService,
        };

        const templateGlobalPathsProvider = {
            provide: TEMPLATE_GLOBAL_PATHS_TOKEN,
            useValue: (typeof options.path === 'string' ? [options.path] : options.path) || [],
        };

        return {
            module: TemplateModule,
            global: true,
            providers: [
                templateGlobalPathsProvider,
                {
                    provide: TEMPLATE_PATHS_LOADER_TOKEN,
                    useFactory: (paths, globalPaths) => {
                        globalPaths.forEach(value => paths.push(value));
                        return;
                    },
                    inject: [TEMPLATE_PATHS_TOKEN, TEMPLATE_GLOBAL_PATHS_TOKEN],
                },
                {
                    provide: NUNJUCKS_TOKEN,
                    useFactory: (paths) => {
                        return new Environment(
                            new FileSystemLoader(paths),
                            { autoescape: true },
                        );
                    },
                    inject: [TEMPLATE_PATHS_TOKEN],
                },
                templateServiceProvider,
                NunjucksService,
            ],
            exports: [
                templateServiceProvider.provide,
                NUNJUCKS_TOKEN,
                NunjucksService,
            ],
        };
    }

    static forFeature(path: string | string[]): DynamicModule {
        const templateModulePathsProvider = {
            provide: TEMPLATE_MODULE_PATHS_TOKEN,
            useValue: (typeof path === 'string' ? [path] : path) || [],
        };

        return {
            module: TemplateModule,
            providers: [
                templateModulePathsProvider,
                {
                    provide: TEMPLATE_PATHS_LOADER_TOKEN,
                    useFactory: (paths, modulePaths) => {
                        modulePaths.forEach(value => paths.push(value));
                        return;
                    },
                    inject: [TEMPLATE_PATHS_TOKEN, TEMPLATE_MODULE_PATHS_TOKEN],
                },
            ]
        };
    }
}
