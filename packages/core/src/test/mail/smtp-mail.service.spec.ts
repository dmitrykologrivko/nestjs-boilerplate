import { Transporter } from 'nodemailer';
import { mock, MockProxy } from 'jest-mock-extended';
import { SmtpMailService } from '../../mail/smtp-mail.service';
import { PropertyConfigService } from '../../config/property-config.service';
import { Mail } from '../../mail/mail.interfaces';

describe('SmtpMailService', () => {
    const mockTransporter = mock<Transporter>();

    class TestMailService extends SmtpMailService {
        protected createTransport(mass: boolean): Transporter {
            return mockTransporter;
        }
    }

    let service: TestMailService;
    let configMock: MockProxy<PropertyConfigService>;

    beforeEach(() => {
        configMock = mock<PropertyConfigService>();
        configMock.get.mockReturnValue({
            smtp: {
                host: 'smtp.example.com',
                port: 587,
                useTls: true,
                auth: { user: 'user@example.com', password: 'password' },
                timeout: 5000,
            },
        });

        service = new TestMailService(configMock);
    });

    describe('#sendMail', () => {
        it('should send mail using the transporter', async () => {
            const mail: Mail = {
                to: 'recipient@example.com',
                subject: 'Test',
                text: 'Hello',
            };

            await service.sendMail(mail);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                subject: 'Test',
                text: 'Hello',
                html: undefined,
                headers: undefined,
                attachments: undefined,
                from: undefined,
                to: 'recipient@example.com',
                cc: undefined,
                bcc: undefined,
                replyTo: undefined,
            });
        });
    });
});
