import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '../../config/config.module';
import { PropertyConfigService } from '../../config/property-config.service';
import baseConfig from '../../config/global.config';

describe('ConfigModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(metadata: ModuleMetadata) {
        module = await Test.createTestingModule(metadata).compile();
        return module;
    }

    afterEach(async () => {
        if (module) await module.close();
    });

    it('should register services in the module', async () => {
        module = await createTestingModule({
            imports: [
                ConfigModule,
            ]
        });

        const service = module.get(PropertyConfigService);
        const configService = module.get(ConfigService);

        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(PropertyConfigService);
        expect(configService).toBeDefined();
        expect(configService).toBeInstanceOf(ConfigService);
    });

    it('should load global config', async () => {
        module = await createTestingModule({
            imports: [
                ConfigModule,
            ]
        });

        const config = baseConfig();
        const service = module.get(ConfigService);

        Object.keys(config)
            .forEach((key) => {
                expect(service.get(key)).toEqual(config[key]);
            });
    });

    describe('#forRoot()', () => {
        it('should load custom config', async () => {
            module = await createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        load: [
                            () => ({
                                test: 'test-value',
                            }),
                        ]
                    }),
                ]
            });

            const service = module.get(ConfigService);

            expect(service.get('test')).toEqual('test-value');
        });
    });

    describe('#forFeature()', () => {
        it('should load custom config', async () => {
            module = await createTestingModule({
                imports: [
                    ConfigModule.forFeature(
                        () => ({
                            feature: 'feature-value',
                        }),
                    ),
                    ConfigModule.forRoot(),
                ]
            });

            const service = module.get(ConfigService);

            expect(service.get('feature')).toEqual('feature-value');
        });
    });
});
