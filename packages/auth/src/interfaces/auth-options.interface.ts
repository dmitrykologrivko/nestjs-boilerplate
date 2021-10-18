export interface AuthOptions {
    jwt: {
        expiresIn: string;
        revokeAfterChangedPassword: boolean;
    },
}
