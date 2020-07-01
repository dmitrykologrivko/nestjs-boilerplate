import { Global, Module, DynamicModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModuleOptions as NestConfigModuleOptions } from '@nestjs/config/dist/interfaces/config-module-options.interface';
import { ConfigFactory as NestConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';
import { PropertyConfigService } from './property-config.service';
import baseConfig from './global.config';

export type ConfigModuleOptions = NestConfigModuleOptions;
export type ConfigFactory = NestConfigFactory;

@Global()
@Module({
    imports: [NestConfigModule.forFeature(baseConfig)],
    providers: [PropertyConfigService],
    exports: [NestConfigModule, PropertyConfigService],
})
export class ConfigModule {

    static forRoot(options: ConfigModuleOptions): DynamicModule {
        return {
            module: ConfigModule,
            imports: [NestConfigModule.forRoot(options)],
        };
    }

    static forFeature(config: ConfigFactory): DynamicModule {
        return {
            module: ConfigModule,
            imports: [NestConfigModule.forFeature(config)],
        };
    }
}
