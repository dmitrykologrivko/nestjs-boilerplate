export interface UserOptions {
    password: {
        resetTimeout: string;
        resetMailSubject: string;
        resetMailTemplate: string;
        saltRounds: number;
    },
    jwt: {
        expiresIn: string;
    },
}
