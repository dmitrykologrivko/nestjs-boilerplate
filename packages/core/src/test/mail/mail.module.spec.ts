import { Injectable, ModuleMetadata, Module, Global } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '../../config/config.module';
import { PropertyConfigService } from '../../config/property-config.service';
import { MailModule } from '../../mail/mail.module';
import { Mail } from '../../mail/mail.interfaces';
import { BaseMailService } from '../../mail/base-mail.service';
import { SmtpMailService } from '../../mail/smtp-mail.service';
import mailConfig from '../../mail/mail.config';

describe('MailModule (Integration)', () => {
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
                MailModule,
            ]
        });

        const smtpMailService = module.get(SmtpMailService);

        expect(smtpMailService).toBeDefined();
        expect(smtpMailService).toBeInstanceOf(SmtpMailService);
    });

    it('should load server config', async () => {
        module = await createTestingModule({
            imports: [
                MailModule,
            ]
        });

        const config = mailConfig();
        const service = module.get(ConfigService);

        Object.keys(config)
            .forEach((key) => {
                expect(service.get(key)).toEqual(config[key]);
            });
    });

    describe('#forRoot()', () => {
        it('should register SmtpMailService as BaseMailService by default', async () => {
            module = await createTestingModule({
                imports: [
                    ConfigModule.forRoot(),
                    MailModule.forRoot(),
                ]
            });

            const service = module.get(BaseMailService);

            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(SmtpMailService);
        });

        it('should allow overriding BaseMailService with custom implementation', async () => {
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
                    TestMailService,
                ]
            })
            class TestMailModule {}

            module = await createTestingModule({
                imports: [
                    TestMailModule,
                    ConfigModule.forRoot(),
                    MailModule.forRoot({
                        service: TestMailService
                    }),
                ],
            });

            const service = module.get(BaseMailService);
            const smtpService = module.get(SmtpMailService);
            const testService = module.get(TestMailService);

            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(TestMailService);
            expect(smtpService).toBeDefined();
            expect(smtpService).toBeInstanceOf(SmtpMailService);
            expect(testService).toBeDefined();
            expect(testService).toBeInstanceOf(TestMailService);
            expect(service).toBe(testService);
        });
    });
});
