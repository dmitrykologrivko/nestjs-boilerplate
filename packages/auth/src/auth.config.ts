export default () => ({
    auth: {
        jwt: {
            expiresIn: process.env.AUTH_JWT_EXPIRES_IN || '24h',
            revokeAfterChangedPassword: Boolean(process.env.AUTH_JTW_REVOKE_AFTER_CHANGED_PASSWORD) || false,
        },
    },
});
