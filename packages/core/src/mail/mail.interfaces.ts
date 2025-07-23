import { Readable } from 'stream';
import { Url } from 'url';

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

export interface Mail<T extends Attachment = Attachment> {
    subject: string;
    text: string;
    html?: string;
    headers?: { key: string, value: string }[];
    attachments?: T[];
    to: string | Address | (string | Address)[];
    cc?: string | Address | (string | Address)[];
    bcc?: string | Address | (string | Address)[];
    from?: string | Address;
    replyTo?: string | Address;
}

export interface MailOptions {
    defaultFrom: string;
    smtp: {
        host: string;
        port: number;
        useTls: boolean;
        auth: {
            user: string;
            password: string;
        }
        timeout: number;
    };
}
