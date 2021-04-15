export default () => ({
    mail: {
        defaultFrom: process.env.MAIL_DEFAULT_FROM,
        smtp: {
            host: process.env.MAIL_SMTP_HOST,
            port: process.env.MAIL_SMTP_PORT,
            useTls: Boolean(process.env.MAIL_SMTP_USE_TLS),
            auth: {
                user: process.env.MAIL_SMTP_AUTH_USER,
                password: process.env.MAIL_SMTP_AUTH_PASSWORD,
            },
            timeout: process.env.MAIL_SMTP_TIMEOUT,
        }
    }
});
