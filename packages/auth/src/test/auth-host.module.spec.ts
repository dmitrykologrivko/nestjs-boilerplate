import {
    Injectable,
    Module,
    ModuleMetadata,
    Global,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule } from '@nestjs-boilerplate/core';
import { BaseRevokedTokensService } from '../services/base-revoked-tokens.service';
import {
    AUTH_PASSPORT_OPTIONS_TOKEN,
    AUTH_JWT_OPTIONS_TOKEN,
    AuthHostModule,
    AuthHostModuleOptions
} from '../auth-host.module';

describe('AuthHostModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(
        options?: AuthHostModuleOptions,
        extra?: ModuleMetadata
    ) {
        const appConfig = () => ({
            secretKey: 'test-secret'
        });

        module = await Test.createTestingModule({
            ...extra,
            imports: [
                CoreModule.forRoot({
                    config: {
                        load: [appConfig]
                    }
                }),
                AuthHostModule.forRoot(options),
                ...extra?.imports || [],
            ]
        }).compile();

        return module;
    }

    afterEach(async () => {
        if (module) await module.close();
    });

    describe('#forRoot()', () => {
        it('should define module with default module config', async () => {
            await createTestingModule();
            expect(module).toBeDefined();
        });

        it('should register services in the module', async () => {
            await createTestingModule();

            const passportOptions = module.get(AUTH_PASSPORT_OPTIONS_TOKEN);
            const jwtOptions = module.get(AUTH_JWT_OPTIONS_TOKEN);

            expect(passportOptions).toBeDefined();
            expect(jwtOptions).toBeDefined();
        });

        it('should register passport options', async () => {
            const testStrategy = 'test-strategy';

            await createTestingModule({
                passport: {
                    type: undefined,
                    value: {
                        defaultStrategy: testStrategy
                    }
                }
            });

            const passportOptions = module.get(AUTH_PASSPORT_OPTIONS_TOKEN);

            expect(passportOptions).toBeDefined();
            expect(passportOptions.defaultStrategy).toBe(testStrategy);
        });

        it('should register async passport options', async () => {
            const testStrategy = 'test-strategy';

            await createTestingModule({
                passport: {
                    type: 'async',
                    value: {
                        useFactory: () => ({ defaultStrategy: testStrategy }),
                        inject: [],
                    },
                }
            });

            const passportOptions = module.get(AUTH_PASSPORT_OPTIONS_TOKEN);

            expect(passportOptions).toBeDefined();
            expect(passportOptions.defaultStrategy).toBe(testStrategy);
        });

        it('should register jwt options', async () => {
            const testSecret = 'test-secret2';

            await createTestingModule({
                jwt: {
                    type: undefined,
                    value: {
                        secret: testSecret
                    },
                }
            });

            const jwtOptions = module.get(AUTH_JWT_OPTIONS_TOKEN);

            expect(jwtOptions).toBeDefined();
            expect(jwtOptions.secret).toBe(testSecret);
        });

        it('should register async jwt options', async () => {
            const testSecret = 'test-secret2';

            await createTestingModule({
                jwt: {
                    type: 'async',
                    value: {
                        useFactory: () => ({ secret: testSecret }),
                        inject: [],
                    },
                }
            });

            const jwtOptions = module.get(AUTH_JWT_OPTIONS_TOKEN);

            expect(jwtOptions).toBeDefined();
            expect(jwtOptions.secret).toBe(testSecret);
        });

        it('should register custom BaseRevokedTokensService', async () => {
            @Injectable()
            class CustomRevokedTokensService extends BaseRevokedTokensService {
                clearRevokedTokens(): Promise<Promise<void>> {
                    return Promise.resolve(Promise.resolve(undefined));
                }

                isTokenRevoked(token: string): Promise<boolean> {
                    return Promise.resolve(false);
                }

                revokeToken(token: string, ttl?: number): Promise<void> {
                    return Promise.resolve(undefined);
                }
            }

            @Global()
            @Module({
                providers: [CustomRevokedTokensService],
                exports: [CustomRevokedTokensService]
            })
            class TestModule {}

            await createTestingModule({
                revokedTokensService: CustomRevokedTokensService,
            }, {
                imports: [TestModule]
            });

            const revokedTokensService = module.get(BaseRevokedTokensService);

            expect(revokedTokensService).toBeDefined();
            expect(revokedTokensService).toBeInstanceOf(CustomRevokedTokensService);
        });
    });
});
