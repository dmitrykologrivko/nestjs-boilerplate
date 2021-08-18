export default () => ({
    auth: {
        password: {
            resetTimeout: process.env.AUTH_PASSWORD_RESET_TIMEOUT || '24h',
            resetMailSubject: process.env.AUTH_PASSWORD_RESET_MAIL_SUBJECT || 'Reset Password',
            resetMailTemplate: process.env.AUTH_PASSWORD_RESET_MAIL_TEMPLATE || 'reset_password.html',
            saltRounds: Number(process.env.AUTH_PASSWORD_SALT_ROUNDS) || 10,
        },
        jwt: {
          expiresIn: process.env.AUTH_JWT_EXPIRES_IN || '24h',
        },
    },
});
