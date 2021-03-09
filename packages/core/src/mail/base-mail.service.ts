import { Readable } from 'stream';
import { Url } from 'url';
import { Result } from '../utils/monads';
import { SendMailFailedException } from './send-mail-failed.exception';

export interface Address {
    name: string;
    address: string;
}

interface Attachment {
    content?: string | Buffer | Readable;
    path?: string | Url;
    filename?: string | false;
    contentType?: string;
    encoding?: string;
    headers?: { key: string, value: string }[];
}

export interface Mail {
    subject: string;
    text: string;
    html?: string;
    headers?: { key: string, value: string }[];
    attachments?: Attachment[];
    from: string | Address;
    to: (string | Address)[];
    cc?: (string | Address)[];
    bcc?: (string | Address)[];
    replyTo?: string | Address;
}

export abstract class BaseMailService {

    abstract async sendMail(mail: Mail): Promise<Result<void, SendMailFailedException>>;

}
