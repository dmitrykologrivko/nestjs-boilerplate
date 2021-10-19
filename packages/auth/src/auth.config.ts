export default () => ({
    auth: {
        jwt: {
            expiresIn: process.env.AUTH_JWT_EXPIRES_IN || '24h',
            revokeAfterLogout: Boolean(process.env.AUTH_JWT_REVOKE_AFTER_LOGOUT) || false,
            revokeAfterChangedPassword: Boolean(process.env.AUTH_JWT_REVOKE_AFTER_CHANGED_PASSWORD) || false,
        },
    },
});
