export interface AuthOptions {
    jwt: {
        expiresIn: string;
        revokeAfterLogout: boolean;
        revokeAfterChangedPassword: boolean;
    },
}
