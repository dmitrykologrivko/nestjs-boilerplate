export default () => ({
    mail: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: Boolean(process.env.MAIL_SECURE),
        auth: {
            user: process.env.MAIL_AUTH_USER,
            password: process.env.MAIL_AUTH_PASSWORD,
        }
    }
});
