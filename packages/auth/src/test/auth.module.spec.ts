import {
    Injectable,
    Module,
    ModuleMetadata,
    Global,
    INestApplication,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule, EventBus } from '@nestjs-boilerplate/core';
import { UserJwtService } from '../services/user-jwt.service';
import { JwtAuthService } from '../services/jwt-auth.service';
import { BaseRevokedTokensService } from '../services/base-revoked-tokens.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { UserChangedPasswordEventHandler } from '../events/user-changed-password-event.handler';
import { AuthJwtController } from '../controllers/auth-jwt.controller';
import { AuthPasswordController } from '../controllers/auth-password.controller';
import { AuthModule, AuthModuleOptions } from '../auth.module';
import { AUTH_PASSPORT_OPTIONS_TOKEN, AUTH_JWT_OPTIONS_TOKEN } from '../auth-host.module';
import authConfig from '../auth.config';

describe('AuthModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(
        options?: AuthModuleOptions,
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
                AuthModule.forRoot(options),
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

        it('should register services and controllers in the module', async () => {
            await createTestingModule();

            const jwtAuthService = module.get(JwtAuthService);
            const userChangedPasswordEventHandler = module.get(UserChangedPasswordEventHandler);
            const userJwtService = module.get(UserJwtService);
            const jwtAuthGuard = module.get(JwtAuthGuard);
            const isAdminGuard = module.get(IsAdminGuard);
            const jwtStrategy = module.get(JwtStrategy);
            const authJwtController = module.get(AuthJwtController);
            const authPasswordController = module.get(AuthPasswordController);

            expect(jwtAuthService).toBeDefined();
            expect(jwtAuthService).toBeInstanceOf(JwtAuthService);
            expect(userChangedPasswordEventHandler).toBeDefined();
            expect(userChangedPasswordEventHandler).toBeInstanceOf(UserChangedPasswordEventHandler);
            expect(userJwtService).toBeDefined();
            expect(userJwtService).toBeInstanceOf(UserJwtService);
            expect(jwtAuthGuard).toBeDefined();
            expect(jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
            expect(isAdminGuard).toBeDefined();
            expect(isAdminGuard).toBeInstanceOf(IsAdminGuard);
            expect(jwtStrategy).toBeDefined();
            expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
            expect(authJwtController).toBeDefined();
            expect(authJwtController).toBeInstanceOf(AuthJwtController);
            expect(authPasswordController).toBeDefined();
            expect(authPasswordController).toBeInstanceOf(AuthPasswordController);
        });

        it('should load auth config', async () => {
            await createTestingModule();

            const config = authConfig();
            const service = module.get(ConfigService);

            Object.keys(config)
                .forEach((key) => {
                    expect(service.get(key)).toEqual(config[key]);
                });
        });

        it('should disable AuthJwtController', async () => {
            await createTestingModule({
                enableAuthJwtApi: false
            });
            expect(() => module.get(AuthJwtController)).toThrowError(
                /Nest could not find AuthJwtController element/
            );
        });

        it('should disable AuthPasswordController', async () => {
            await createTestingModule({
                enableAuthPasswordApi: false
            });
            expect(() => module.get(AuthPasswordController)).toThrowError(
                /Nest could not find AuthPasswordController element/
            );
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

            // tslint:disable-next-line:max-classes-per-file
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

    describe('#onModuleInit()', () => {
        let app: INestApplication;

        beforeEach(async () => {
            await createTestingModule();
            app = module.createNestApplication();
            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('should register event handlers', async () => {
            const eventBus = module.get(EventBus);

            let hasUserChangedPasswordEventHandler = false;
            eventBus.handlers.forEach((handler) => {
                if (handler instanceof UserChangedPasswordEventHandler) {
                    hasUserChangedPasswordEventHandler = true;
                }
            });

            expect(hasUserChangedPasswordEventHandler).toBe(true);
        });
    });
});
