export default () => ({
    auth: {
        password: {
            resetTimeout: process.env.AUTH_PASSWORD_RESET_TIMEOUT || '24h',
            saltRounds: Number(process.env.AUTH_PASSWORD_SALT_ROUNDS) || 10,
        },
        jwt: {
          expiresIn: process.env.AUTH_JWT_EXPIRES_IN || '24h',
        },
    },
});
