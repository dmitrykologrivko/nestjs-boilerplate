import { mock, MockProxy } from 'jest-mock-extended';
import { BaseMailService } from '../../mail/base-mail.service';
import { PropertyConfigService } from '../../config/property-config.service';
import { Mail, MailOptions } from '../../mail/mail.interfaces';

describe('BaseMailService', () => {
    let mailBox = [];

    class TestMailService extends BaseMailService<Mail, any> {
        protected async onOpenConnection(mass: boolean): Promise<any> {
            return {};
        }

        protected async onCloseConnection(connection: any, mass: boolean) {
            return;
        }

        protected async onSendMail(mail: Mail, connection: any): Promise<void> {
            mailBox.push(mail);
            return;
        }
    }

    let service: TestMailService;
    let configMock: MockProxy<PropertyConfigService>;

    beforeEach(() => {
        configMock = mock<PropertyConfigService>();
        configMock.get.mockReturnValue({
            smtp: { host: 'localhost', port: 587 },
            defaultFrom: 'default@example.com',
        } as MailOptions);

        service = new TestMailService(configMock);
        mailBox = [];
    });

    describe('#sendMail()', () => {
        it('should send a single mail', async () => {
            const mail: Mail = { to: 'recipient@example.com', subject: 'Test', text: 'Hello' };

            expect(mailBox.length).toEqual(0);

            await service.sendMail(mail);

            expect(mailBox.length).toEqual(1);
            expect(mailBox[0].to).toEqual('recipient@example.com');
            expect(mailBox[0].subject).toEqual('Test');
            expect(mailBox[0].text).toEqual('Hello');
        });

        it('should send multiple mails', async () => {
            const mails: Mail[] = [
                { to: 'recipient1@example.com', subject: 'Test 1', text: 'Hello 1' },
                { to: 'recipient2@example.com', subject: 'Test 2', text: 'Hello 2' },
            ];

            expect(mailBox.length).toEqual(0);

            await service.sendMail(mails);

            expect(mailBox.length).toEqual(2);
            expect(mailBox[0].to).toEqual('recipient1@example.com');
            expect(mailBox[0].subject).toEqual('Test 1');
            expect(mailBox[0].text).toEqual('Hello 1');
            expect(mailBox[1].to).toEqual('recipient2@example.com');
            expect(mailBox[1].subject).toEqual('Test 2');
            expect(mailBox[1].text).toEqual('Hello 2');
        });
    });
});
