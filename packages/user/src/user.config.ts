export default () => ({
    user: {
        password: {
            resetTimeout: process.env.USER_PASSWORD_RESET_TIMEOUT || '24h',
            resetMailSubject: process.env.USER_PASSWORD_RESET_MAIL_SUBJECT || 'Reset Password',
            resetMailTemplate: process.env.USER_PASSWORD_RESET_MAIL_TEMPLATE || 'user__reset_password.html',
            saltRounds: Number(process.env.USER_PASSWORD_SALT_ROUNDS) || 10,
        },
    },
});
