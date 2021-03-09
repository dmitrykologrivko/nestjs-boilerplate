export interface MailOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        password: string;
    }
}
