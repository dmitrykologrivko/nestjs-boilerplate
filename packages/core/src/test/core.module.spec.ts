import { Injectable, Module, Global } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule, CoreModuleOptions } from '../core.module';
import { DatabaseModule } from '../database/database.module';
import { PropertyConfigService } from '../config/property-config.service';
import { BaseMailService } from '../mail/base-mail.service';
import { Mail } from '../mail/mail.interfaces';
import { BaseTemplateService } from '../template/base-template.service';

describe('CoreModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(options?: CoreModuleOptions) {
        module = await Test.createTestingModule({
            imports: [CoreModule.forRoot(options)],
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

        it('should load with default module config', async () => {
            await createTestingModule();

            const configService = module.get(PropertyConfigService);
            const mailService = module.get(BaseMailService);
            const templateService = module.get(BaseTemplateService);
            const dataSource = module.get(DataSource);

            expect(configService).toBeDefined();
            expect(mailService).toBeDefined();
            expect(templateService).toBeDefined();
            expect(dataSource).toBeDefined();
        });

        it('should set custom config', async () => {
            await createTestingModule({
                config: {
                    load: [() => ({ custom: 'value' })],
                },
            });

            const configService = module.get(PropertyConfigService);
            expect(configService.get({ path: 'custom' })).toBe('value');
        });

        it('should set custom mail service', async () => {
            @Injectable()
            class TestMailService extends BaseMailService {
                constructor(config: PropertyConfigService) {
                    super(config);
                }

                protected onCloseConnection(connection: any, mass: boolean) {
                    return;
                }

                protected onOpenConnection(mass: boolean): Promise<any> {
                    return Promise.resolve(undefined);
                }

                protected onSendMail(mail: Mail, connection: any): Promise<void> {
                    return Promise.resolve(undefined);
                }
            }

            // tslint:disable-next-line:max-classes-per-file
            @Global()
            @Module({
                providers: [
                    TestMailService,
                ],
                exports: [
                    TestMailService
                ]
            })
            class TestMailModule {}

            await createTestingModule({
                imports: [
                    TestMailModule
                ],
                mail: {
                    service: TestMailService
                },
            });

            const mailService = module.get(BaseMailService);
            expect(mailService).toBeDefined();
            expect(mailService).toBeInstanceOf(TestMailService);
        });

        it('should set custom template service', async () => {
            // tslint:disable-next-line:max-classes-per-file
            @Injectable()
            class TestTemplateService extends BaseTemplateService {
                render(template: string, context?: object): Promise<string> {
                    return Promise.resolve('');
                }
            }

            // tslint:disable-next-line:max-classes-per-file
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
                ],
                template: {
                    service: TestTemplateService,
                },
            });

            const templateService = module.get(BaseTemplateService);
            expect(templateService).toBeDefined();
            expect(templateService).toBeInstanceOf(TestTemplateService);
        });

        it('should load database with custom options', async () => {
            await createTestingModule({
                imports: [
                    DatabaseModule.withOptions([
                        {
                            name: 'primary',
                            type: 'sqlite',
                            database: ':memory:',
                            entities: [],
                            synchronize: true,
                        },
                    ])
                ]
            });

            const dataSource = module.get(getDataSourceToken('primary'));

            expect(dataSource).toBeDefined();
            expect(dataSource).toBeInstanceOf(DataSource);
        });
    });
});
